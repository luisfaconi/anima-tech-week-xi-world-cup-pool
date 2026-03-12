import { z } from 'zod';

export const UpdateMatchResultSchema = z.object({
  teamAScore: z.number().int().nonnegative(),
  teamBScore: z.number().int().nonnegative(),
  status: z.enum(['scheduled', 'live', 'finished']),
});

export type UpdateMatchResultInput = z.infer<typeof UpdateMatchResultSchema>;
