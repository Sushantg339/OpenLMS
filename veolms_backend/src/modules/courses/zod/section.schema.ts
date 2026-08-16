import {z} from "zod";

export const createSectionSchema = z.object({
    title: z.string().trim().min(1, "Title is required"),
    orderIndex: z.number().int().nonnegative("Order index must be 0 or greater")
})

export const updateSectionSchema = z.object({
    title: z.string().trim().min(1, "Title is required").optional().nullable(),
    orderIndex: z.number().int().nonnegative("Order index must be 0 or greater").optional().nullable()
})

export const reorderSectionSchema = z.object({
    sections: z.array(z.object({
        id: z.string().trim(),
        orderIndex: z.number().int().nonnegative()
    }))
})