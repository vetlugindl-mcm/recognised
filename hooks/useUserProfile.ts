import { useMemo } from 'react';
import { AnalysisItem, UserProfile } from '../types';
import { mergeProfiles } from '../utils/profileMerger';

/**
 * React Hook that acts as a wrapper around the pure business logic.
 * It memoizes the result to prevent unnecessary re-renders.
 */
export const useUserProfile = (results: AnalysisItem[]): UserProfile => {
  return useMemo<UserProfile>(() => {
    return mergeProfiles(results);
  }, [results]);
};