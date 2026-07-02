import { useContext } from 'react';
import { LearningPathsContext } from './LearningPathsContext';
import type { LearningPathsContextValue } from './types';

export const useLearningPaths = (): LearningPathsContextValue => {
  const ctx = useContext(LearningPathsContext);
  if (!ctx) {
    throw new Error(
      "useLearningPaths must be used within a LearningPathsProvider"
    );
  }
  return ctx;
};