import { useState, useEffect } from 'react';
import { AnalysisItem, UploadedFile } from '../types';
import { StorageService } from '../services/storageService';

/**
 * Manages the "File" side of the data. 
 * Hydrates File blobs from IndexedDB based on metadata in analysisResults.
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
                // Pure data. No UI concern (URL generation) here.
                const fileObj: UploadedFile = {
                    id: item.fileId,
                    file: fileBlob,
                };
                restoredFiles.push(fileObj);
            } else {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisResults]);

  // Cleanup: We no longer need to revoke URLs here because we aren't creating them here.
  // The FilePreview component handles that via useObjectUrl.

  return { files, setFiles, isHydrating };
};