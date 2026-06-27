import {z} from "zod";

export const createCourseSchema = z.object({
    title: z.string().trim().min(4, "Title should atleast be 4 characters long"),
    slug: z.string().trim().min(4).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can contain only lowercase letters, numbers and hyphens"),
    description: z.string().trim().optional(),
    thumbnailUrl: z.url().optional(),
    trailerVideoUrl: z.url().optional(),
    price: z.number().int().positive("Price must be greater than 0"),
    instructorName: z.string().trim().min(3)
})

export const updateCourseSchema = z.object({
    title: z.string().trim().min(4, "Title should atleast be 4 characters long").nullable().optional(),
    description: z.string().trim().optional().nullable(),
    thumbnailUrl: z.url().optional().nullable(),
    trailerVideoUrl: z.url().optional().nullable(),
    price: z.number().int().positive("Price must be greater than 0").nullable().optional(),
    instructorName: z.string().trim().min(3).nullable().optional(),
    isPublished: z.boolean().optional().nullable()
})