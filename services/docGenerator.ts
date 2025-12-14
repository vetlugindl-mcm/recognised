import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import FileSaver from 'file-saver';
import { UserProfile } from '../types';
import { mapProfileToTemplateVariables } from '../utils/templateMapper';

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
   * Generates a filled DOCX file from a template and user profile.
   * @param templateFile The uploaded .docx template file
   * @param userProfile The aggregated user data
   * @returns Promise that resolves when download starts
   */
  static async generateDocument(templateFile: File, userProfile: UserProfile): Promise<void> {
    try {
      // UX: Artificial delay to show the "Generating..." state
      await new Promise(resolve => setTimeout(resolve, 800));

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

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const originalName = templateFile.name.replace('.docx', '');
      const lastName = userProfile.passport.data?.lastName || 'Candidate';
      const fileName = `${originalName}_${lastName}_Filled.docx`;
      
      // Fix for "The requested module 'file-saver' does not provide an export named 'saveAs'"
      // We cast the default import to handle both the function-as-default and object-with-saveAs scenarios
      const saver = FileSaver as unknown as FileSaverModule;
      const saveFunc = saver.saveAs || saver;
      
      saveFunc(out, fileName);

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
            
            // Prevent spamming the same variable error multiple times
            if (tag && uniqueTags.has(tag)) return null;
            if (tag) uniqueTags.add(tag);

            if (e.properties?.id === 'duplicate_open_tag') {
                return `⚠️ Переменная "${tag}" сломана форматированием Word.\n   Причина: Word разбил скобку "{" на части.\n   Решение: Удалите переменную, напишите её в Блокноте (Notepad), скопируйте и вставьте в Word.`;
            }
            if (e.properties?.id === 'duplicate_close_tag') {
                return `⚠️ Лишняя закрывающая скобка "}" в переменной "${tag}".`;
            }
            if (e.properties?.id === 'unclosed_tag') {
                return `⚠️ Не закрыта скобка в переменной "${tag}". Ожидается "}".`;
            }
            return null;
        }).filter(Boolean);

        if (errors.length > 0) {
            friendlyMessage = `Ошибка в шаблоне Word:\n\n${errors.join('\n\n')}`;
            throw new Error(friendlyMessage);
        }
      }
      
      if (error instanceof Error) {
        friendlyMessage += ` ${error.message}`;
      }
      
      throw new Error(friendlyMessage);
    }
  }
}