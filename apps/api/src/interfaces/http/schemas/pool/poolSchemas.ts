import { z } from 'zod';

export const scoringRulesSchema = z.object({
  exact_score: z.number().min(0),
  goal_difference: z.number().min(0).optional(),
  correct_winner: z.number().min(0),
  wrong: z.number().min(0),
});

export const createPoolSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  ownerId: z.number().int().positive(),
  scoringRules: scoringRulesSchema.optional(),
});

export const updatePoolSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  scoringRules: scoringRulesSchema.optional(),
});

export const joinPoolSchema = z.object({
  userId: z.number().int().positive(),
  inviteCode: z.string().min(1).max(20),
});

export const poolIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number),
});

export const removePoolMemberSchema = z.object({
  poolId: z.string().regex(/^\d+$/).transform(Number),
  userId: z.string().regex(/^\d+$/).transform(Number),
});
