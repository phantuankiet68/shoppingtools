import { z } from 'zod';

export const SignInSchema = z.object({
    email: z.string().trim().email('Email is invalid').max(255),

    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export type SignInInput = z.infer<typeof SignInSchema>;
