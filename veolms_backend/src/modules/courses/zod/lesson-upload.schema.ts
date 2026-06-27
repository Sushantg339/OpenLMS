import { z } from "zod"

export const requestUploadUrlSchema = z.object({
    fileName: z.string().trim().min(1),
    contentType: z.enum(["video/mp4", "video/webm"]),
})