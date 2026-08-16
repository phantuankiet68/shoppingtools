import { z } from 'zod';

export const CreateSiteSchema = z.object({
    name: z
        .string()
        .min(2)
        .max(100)
        .transform((s) => s.trim()),
    domain: z
        .string()
        .min(3)
        .max(255)
        .transform((s) => s.trim().toLowerCase())
        .refine(
            (s) => !s.startsWith('http://') && !s.startsWith('https://'),
            'Domain should not include protocol',
        )
        .refine((s) => /^[a-z0-9.-]+$/.test(s), 'Domain only allows a-z, 0-9, dot, dash'),
    type: z.string().optional(),
    category: z.string().max(100).optional().nullable(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    contactPhone: z.string().optional().nullable(),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED']).optional(),
    isPublic: z.boolean().optional(),
    publishedAt: z.string().optional().nullable(),
    workspaceId: z.string().optional(),
});

export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;

export function validateSiteInput(input: unknown) {
    return CreateSiteSchema.safeParse(input);
}
