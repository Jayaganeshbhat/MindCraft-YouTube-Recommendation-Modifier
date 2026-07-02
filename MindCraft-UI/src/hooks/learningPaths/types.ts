import type { ReactNode } from 'react';

export type LearningPathSummary = {
  id: string;
  name: string;
  type: string;
  roleOrSkill: string;
  level: string;
  pace: string;
  finishIn: number | null;
  finishUnit: string | null;
  targetDays: number | null;
  minutesPerDay: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PathsApiResponse = {
  success: boolean;
  count: number;
  data: LearningPathSummary[];
};

export type LearningPathsContextValue = {
  data: LearningPathSummary[] | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
};

export type ProviderProps = {
  children: ReactNode;
};