import { createContext } from 'react';
import type { LearningPathsContextValue } from './types';

export const LearningPathsContext = createContext<LearningPathsContextValue | null>(
  null
);