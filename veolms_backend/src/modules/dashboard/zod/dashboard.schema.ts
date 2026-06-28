import { z } from "zod"

export const updateProgressSchema = z.object({
    watchedSeconds: z.number().int().nonnegative(),
    completed: z.boolean().optional(),
})