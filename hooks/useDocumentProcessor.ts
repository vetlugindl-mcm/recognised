import { useState, useCallback } from 'react';
import { UploadedFile, AnalysisState, AnalysisItem } from '../types';
import { analyzeFile } from '../services/gemini';
import { AppError } from '../utils/errors';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { sortAnalysisResults } from '../utils/documentUtils';

export const useDocumentProcessor = (
    files: UploadedFile[], 
    analysisResults: AnalysisItem[]
) => {
    const { setAnalysisResults } = useAppContext();
    const { notify } = useNotification();
    const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');

    const processFiles = useCallback(async () => {
        const unprocessedFiles = files.filter(f => !analysisResults.some(r => r.fileId === f.id));

        if (unprocessedFiles.length === 0) {
            if (files.length === 0) {
                notify('warning', 'Нет файлов', 'Пожалуйста, загрузите документы перед анализом.');
            } else {
                notify('info', 'Готово', 'Все загруженные файлы уже обработаны.');
            }
            return;
        }

        setAnalysisState('analyzing');
        notify('info', 'Начинаем анализ', `В очереди на обработку: ${unprocessedFiles.length} док.`);
        
        // SEQUENTIAL PROCESSING LOOP
        // Using Promise.all would trigger rate limits immediately with current tier.
        for (const fileObj of unprocessedFiles) {
            try {
                // 1. Analyze
                const analyzedData = await analyzeFile(fileObj.file);
                
                const newItem: AnalysisItem = {
                    fileId: fileObj.id,
                    fileName: fileObj.file.name,
                    data: analyzedData
                };

                // 2. Update Context IMMEDIATELY (User sees result appear)
                setAnalysisResults(prevResults => {
                    const combined = [...prevResults, newItem];
                    return sortAnalysisResults(combined);
                });

                // 3. Artificial Delay (Rate Limiting Safety for Free Tier)
                await new Promise(resolve => setTimeout(resolve, 800));

            } catch (error: unknown) {
                console.error(`Error analyzing ${fileObj.file.name}:`, error);
                const errorMessage = error instanceof AppError 
                    ? error.publicMessage 
                    : "Не удалось обработать файл";

                const errorItem: AnalysisItem = {
                    fileId: fileObj.id,
                    fileName: fileObj.file.name,
                    data: null,
                    error: errorMessage
                };

                // Add error result so the UI stops spinning for this file
                setAnalysisResults(prevResults => {
                    const combined = [...prevResults, errorItem];
                    return sortAnalysisResults(combined);
                });

                // Show error toast
                notify('error', 'Ошибка анализа', `${fileObj.file.name}: ${errorMessage}`);
            }
        }

        setAnalysisState('complete');
        notify('success', 'Обработка завершена', 'Все документы проверены AI.');
    }, [files, analysisResults, setAnalysisResults, notify]);

    return {
        processFiles,
        analysisState,
        setAnalysisState, // Exposed for reset logic
        isAnalyzing: analysisState === 'analyzing',
        isComplete: analysisState === 'complete'
    };
};