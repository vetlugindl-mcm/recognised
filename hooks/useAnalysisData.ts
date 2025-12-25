import { useState, useEffect, useCallback } from 'react';
import { AnalysisItem } from '../types';
import { StorageService } from '../services/storageService';
import { sortAnalysisResults } from '../utils/documentUtils';

export const useAnalysisData = () => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Hydration (Load from Storage)
  useEffect(() => {
    try {
      const savedResults = StorageService.loadAnalysisResults();
      // Ensure loaded data is sorted correctly immediately
      setAnalysisResults(sortAnalysisResults(savedResults));
    } catch (error) {
      console.error("Failed to load analysis results:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Persistence (Save on Change)
  useEffect(() => {
    if (isLoaded) {
      StorageService.saveAnalysisResults(analysisResults);
    }
  }, [analysisResults, isLoaded]);

  // 3. Actions (Business Logic)
  
  // Wrapper for setting results that enforces sorting
  const setSortedResults = useCallback((
    value: AnalysisItem[] | ((prev: AnalysisItem[]) => AnalysisItem[])
  ) => {
    setAnalysisResults(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      return sortAnalysisResults(next);
    });
  }, []);

  const addAnalysisResult = useCallback((item: AnalysisItem) => {
    setSortedResults(prev => [...prev, item]);
  }, [setSortedResults]);

  const updateAnalysisResult = useCallback((fileId: string, updatedItem: AnalysisItem) => {
    // We don't need to re-sort here if priorities haven't changed, but it's safer to keep data consistent
    // However, map usually preserves order. If type changes, priority changes.
    setAnalysisResults(prev => {
       const mapped = prev.map(item => item.fileId === fileId ? updatedItem : item);
       return sortAnalysisResults(mapped);
    });
  }, []);

  const removeAnalysisResult = useCallback((fileId: string) => {
    setAnalysisResults(prev => prev.filter(item => item.fileId !== fileId));
  }, []);

  return {
    analysisResults,
    setAnalysisResults: setSortedResults, // Expose the sorted setter
    addAnalysisResult,
    updateAnalysisResult,
    removeAnalysisResult,
    isAnalysisLoaded: isLoaded
  };
};