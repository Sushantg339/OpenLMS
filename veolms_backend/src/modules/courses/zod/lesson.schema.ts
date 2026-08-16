import {z} from "zod";

export const createLessonSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    isPreview: z.boolean().optional().nullable(),
    orderIndex: z.number().int().nonnegative("Order index must be 0 or greater"),
    videoUrl: z.url("Invalid url format").optional()
})

export const updateLessonSchema = z.object({
    title: z.string().trim().min(1, "Title is required").optional().nullable(),
    orderIndex: z.number().int().nonnegative("Order index must be 0 or greater").optional().nullable(),
    isPreview: z.boolean().optional().nullable(),
    videoUrl: z.url("Invalid url format").optional().nullable()
})

export const reorderLessonSchema = z.object({
    lessons: z.array(z.object({
        id: z.string().trim(),
        orderIndex: z.number().int().nonnegative()
    }))
})
