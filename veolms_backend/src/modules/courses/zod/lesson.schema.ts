import {z} from "zod";

export const createLessonSchema = z.object({
    title: z.string().trim().min(4, "Title should atleast be 4 characters long"),
    isPreview: z.boolean().optional().nullable(),
    orderIndex: z.number().int().positive()
})

export const updateLessonSchema = z.object({
    title: z.string().trim().min(4, "Title should atleast be 4 characters long").optional().nullable(),
    orderIndex: z.number().int().positive().optional().nullable(),
    isPreview: z.boolean().optional().nullable()
})

export const reorderLessonSchema = z.object({
    lessons: z.array(z.object({
        id: z.string().trim(),
        orderIndex: z.number().int().positive()
    }))
})

