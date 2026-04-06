import { z } from 'zod';

export const thoughtSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(10000),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string().min(1).max(50)).max(20).default([])
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export type ThoughtInput = z.infer<typeof thoughtSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
