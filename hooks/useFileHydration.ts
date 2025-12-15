import { useState, useEffect } from 'react';
import { AnalysisItem, UploadedFile } from '../types';
import { StorageService } from '../services/storageService';
import { PdfService } from '../services/pdfService';

/**
 * Manages the "File" side of the data. 
 * While AppContext manages Metadata (AnalysisItem), this hook ensures we have 
 * the actual Blob objects and Previews loaded in the UI for the Scanner.
 */
export const useFileHydration = (analysisResults: AnalysisItem[]) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const hydrateFiles = async () => {
        if (analysisResults.length === 0) {
            if (isMounted) setIsHydrating(false);
            return;
        }

        // Only try to load files that we don't already have in state
        // This prevents reloading existing blobs on every re-render
        const existingIds = new Set(files.map(f => f.id));
        const missingItems = analysisResults.filter(r => !existingIds.has(r.fileId));

        if (missingItems.length === 0) {
             if (isMounted) setIsHydrating(false);
            return;
        }

        const restoredFiles: UploadedFile[] = [];

        for (const item of missingItems) {
            const fileBlob = await StorageService.getFile(item.fileId);
            if (fileBlob) {
                // Determine preview
                let previewUrl: string | undefined = undefined;
                
                if (fileBlob.type.startsWith('image/')) {
                    previewUrl = URL.createObjectURL(fileBlob);
                } else if (fileBlob.type === 'application/pdf') {
                    // Async PDF thumb generation
                    // We don't await this inside the loop to avoid blocking, 
                    // instead we let it update state later or handle it below
                }

                const fileObj: UploadedFile = {
                    id: item.fileId,
                    file: fileBlob,
                    previewUrl
                };

                restoredFiles.push(fileObj);

                // Handle PDF Thumbnail separately to avoid blocking hydration
                if (fileBlob.type === 'application/pdf') {
                    PdfService.generateThumbnail(fileBlob).then(url => {
                        if (url && isMounted) {
                            setFiles(prev => prev.map(f => f.id === item.fileId ? { ...f, previewUrl: url } : f));
                        }
                    });
                }
            } else {
                // Warn but don't crash. The metadata exists but blob is gone.
                console.warn(`File blob missing for ID: ${item.fileId}`);
            }
        }

        if (isMounted && restoredFiles.length > 0) {
            setFiles(prev => [...prev, ...restoredFiles]);
        }
        
        if (isMounted) setIsHydrating(false);
    };

    hydrateFiles();

    return () => {
        isMounted = false;
    };
    // We intentionally omit 'files' from dependency to avoid loop, we check against it inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResults]);

  // Cleanup ObjectURLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [files]);

  return { files, setFiles, isHydrating };
};