import { z } from 'zod';

export const CreateTaskSchema = z.object({
    title: z.string().min(1).max(255),

    description: z.string().optional(),

    imageUrl: z.string().optional(),

    category: z.enum(['DEVELOPMENT', 'DESIGN', 'LEARNING', 'JOB_SEARCH', 'PERSONAL', 'OTHER']),

    startAt: z.string(),

    endAt: z.string(),

    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),

    estimatedMinutes: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
