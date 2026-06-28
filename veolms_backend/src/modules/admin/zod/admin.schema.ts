import { z } from "zod"

export const listStudentsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
})

export const listEnrollmentsSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    courseId: z.string().optional(),
})