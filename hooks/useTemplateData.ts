import { useState, useEffect, useCallback } from 'react';
import { DocumentTemplate } from '../types';
import { StorageService } from '../services/storageService';

export const useTemplateData = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Hydration (Load Metadata + Blob Files)
  useEffect(() => {
    const hydrate = async () => {
      try {
        const templatesMeta = StorageService.loadTemplatesMeta();
        const loadedTemplates: DocumentTemplate[] = [];

        // We need to fetch the actual File objects from IndexedDB
        for (const meta of templatesMeta) {
          const file = await StorageService.getFile(meta.id);
          if (file) {
            loadedTemplates.push({ ...meta, file });
          }
        }
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    hydrate();
  }, []);

  // 2. Persistence (Save Metadata only)
  // Note: Binary files are saved explicitly by the UI when adding, 
  // so we only sync the list metadata here.
  useEffect(() => {
    if (isLoaded) {
      StorageService.saveTemplatesMeta(templates);
    }
  }, [templates, isLoaded]);

  return {
    templates,
    setTemplates,
    isTemplatesLoaded: isLoaded
  };
};