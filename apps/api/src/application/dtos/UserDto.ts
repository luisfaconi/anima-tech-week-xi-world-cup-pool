import { z } from 'zod';

export const CreateUserDto = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
});

export const UserResponseDto = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
});

export type CreateUserInput = z.infer<typeof CreateUserDto>;
export type UserResponse = z.infer<typeof UserResponseDto>;