import { z } from 'zod';

export const createPathSchema = z.object({
  name: z.string().min(1),
  pathType: z.enum(['role', 'skill']),
  selectedRoleOrSkill: z.string().min(1),
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  pace: z.enum(['daily-15', 'daily-30', 'daily-60', 'weekly-3h']),
  finishIn: z.number().int().positive(),
  finishUnit: z.enum(['days', 'weeks', 'months']),
});

export type CreatePathInput = z.infer<typeof createPathSchema>;

export function mapPaceToMinutes(pace: CreatePathInput['pace']): number {
  switch (pace) {
    case 'daily-15':
      return 15;
    case 'daily-30':
      return 30;
    case 'daily-60':
      return 60;
    case 'weekly-3h':
      return Math.round((3 * 60) / 7); // evenly spread to per-day minutes
  }
}

export function toTargetDays(
  finishIn: number,
  unit: CreatePathInput['finishUnit'],
): number {
  switch (unit) {
    case 'days':
      return finishIn;
    case 'weeks':
      return finishIn * 7;
    case 'months':
      return finishIn * 30; // simple heuristic
  }
}
