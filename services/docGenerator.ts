import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { UserProfile } from '../types';
import { mapProfileToTemplateVariables } from '../utils/templateMapper';
import { AppError } from '../utils/errors';

// Strict interface for Docxtemplater error properties
interface TemplateError extends Error {
    properties?: {
        errors?: Array<{
            properties?: {
                id?: string;
                xtag?: string;
            }
        }>
    }
}

// Type definition to handle both CommonJS and ESM exports of FileSaver safely
type FileSaverFunction = (data: Blob | string, filename?: string, options?: unknown) => void;
type FileSaverModule = FileSaverFunction & { saveAs?: FileSaverFunction };

export class DocGeneratorService {
  
  /**
   * Generates a filled DOCX Blob from a template and user profile.
   * Does NOT trigger download automatically.
   */
  static async generateDocumentBlob(templateFile: File, userProfile: UserProfile): Promise<Blob> {
    try {
      const arrayBuffer = await templateFile.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{', end: '}' },
        nullGetter: () => "",
      });

      const data = mapProfileToTemplateVariables(userProfile);
      
      console.log("Injecting Data into Template:", data);

      doc.render(data);

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      return blob;

    } catch (error: unknown) {
      console.error("Doc generation error:", error);
      
      let friendlyMessage = "Не удалось создать документ.";

      // Type Guard for TemplateError
      const isTemplateError = (err: unknown): err is TemplateError => {
          return typeof err === 'object' && err !== null && 'properties' in err;
      }

      // Handle specific Docxtemplater validation errors
      if (isTemplateError(error) && error.properties?.errors) {
        const uniqueTags = new Set<string>();
        
        const errors = error.properties.errors.map((e) => {
            const tag = e.properties?.xtag;
            
            if (tag && uniqueTags.has(tag)) return null;
            if (tag) uniqueTags.add(tag);

            if (e.properties?.id === 'duplicate_open_tag') {
                return `⚠️ Переменная "${tag}" сломана форматированием Word. Удалите и введите заново.`;
            }
            if (e.properties?.id === 'duplicate_close_tag') {
                return `⚠️ Лишняя закрывающая скобка "}" в переменной "${tag}".`;
            }
            if (e.properties?.id === 'unclosed_tag') {
                return `⚠️ Не закрыта скобка в переменной "${tag}".`;
            }
            return null;
        }).filter(Boolean);

        if (errors.length > 0) {
            friendlyMessage = `Ошибка в шаблоне Word:\n\n${errors.join('\n\n')}`;
            throw new AppError('PARSING_ERROR', friendlyMessage, error);
        }
      }
      
      if (error instanceof Error) {
        friendlyMessage += ` ${error.message}`;
      } else if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('UNKNOWN_ERROR', friendlyMessage, error);
    }
  }

  /**
   * Creates a ZIP package containing the generated application and all source files.
   * Triggers download immediately.
   */
  static async generatePackage(
      templateFile: File, 
      userProfile: UserProfile, 
      sourceFiles: File[],
      mode: 'nostroy' | 'nopriz'
  ): Promise<void> {
      try {
          const zip = new JSZip();
          const lastName = userProfile.passport.data?.lastName || 'Candidate';
          const timestamp = new Date().toISOString().split('T')[0];
          
          // 1. Generate Application DOCX
          const docBlob = await this.generateDocumentBlob(templateFile, userProfile);
          const docName = `Заявление_${lastName}_${mode.toUpperCase()}.docx`;
          zip.file(docName, docBlob);

          // 2. Add Source Files
          // Create a folder for cleaner structure
          const sourcesFolder = zip.folder("Исходные_Документы");
          
          if (sourcesFolder) {
              sourceFiles.forEach(file => {
                  sourcesFolder.file(file.name, file);
              });
          }

          // 3. Generate ZIP blob
          const zipContent = await zip.generateAsync({ type: "blob" });
          
          // 4. Download
          const zipName = `Пакет_${mode.toUpperCase()}_${lastName}_${timestamp}.zip`;
          this.saveBlob(zipContent, zipName);

      } catch (error) {
          throw new AppError('UNKNOWN_ERROR', "Ошибка при формировании архива", error);
      }
  }

  /**
   * Helper to trigger browser download
   */
  static saveBlob(blob: Blob, filename: string) {
      const saver = FileSaver as unknown as FileSaverModule;
      const saveFunc = saver.saveAs || saver;
      saveFunc(blob, filename);
  }
}