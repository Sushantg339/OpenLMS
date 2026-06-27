import {z} from "zod";

export const createSectionSchema = z.object({
    title: z.string().trim().min(4, "Title should atleast be 4 characters long"),
    orderIndex: z.number().int().positive()
})

export const updateSectionSchema = z.object({
    title: z.string().trim().min(4, "Title should atleast be 4 characters long").optional().nullable(),
    orderIndex: z.number().int().positive().optional().nullable()
})

export const reorderSectionSchema = z.object({
    sections: z.array(z.object({
        id: z.string().trim(),
        orderIndex: z.number().int().positive()
    }))
})