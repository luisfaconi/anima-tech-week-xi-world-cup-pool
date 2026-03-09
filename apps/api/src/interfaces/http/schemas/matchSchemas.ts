import { z } from 'zod';

export const updateMatchResultSchema = z.object({
  teamAScore: z.number().int().min(0, 'Team A score must be non-negative'),
  teamBScore: z.number().int().min(0, 'Team B score must be non-negative'),
  status: z.enum(['scheduled', 'live', 'finished'], {
    errorMap: () => ({ message: 'Status must be scheduled, live, or finished' }),
  }),
});

export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;
