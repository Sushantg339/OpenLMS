import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { HeadObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"


import { r2Client, R2_BUCKET } from "../../../lib/r2.js"
import { requestUploadUrlSchema } from "../zod/lesson-upload.schema.js"
import { prisma } from "../../../lib/prisma.js"
import asyncHandler from "../../../utils/asyncHandler.js"

const ALLOWED_EXTENSIONS = ["mp4", "webm"]

export const requestUploadUrl = asyncHandler(async (req, res) => {
    const { id: lessonId } = req.params
    const parsed = requestUploadUrlSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Invalid input data",
            error: parsed.error.issues.map(i => ({ 
                message: i.message, 
                code: i.code, 
                path: i.path 
            }))
        })
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId as string } })

    if (!lesson) {
        return res.status(404).json({
            success: false, 
            data: null, 
            message: "Lesson not found",
            error: { 
                message: "Lesson not found." 
            }
        })
    }

    if (lesson.videoUrl && !lesson.rawUploadKey) {
        return res.status(409).json({
            success: false,
            data: null, 
            message: "Cannot upload a video for this lesson",
            error: { 
                message: "This lesson already has an external video URL. Remove it first if you want to upload a file instead." 
            }
        })
    }

    const { fileName, contentType } = parsed.data
    const ext = fileName.split(".").pop()?.toLowerCase()

    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Unsupported file type",
            error: { 
                message: "Only .mp4 and .webm are supported right now." 
            }
        })
    }

    const key = `raw/${lessonId}/${randomUUID()}.${ext}`

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ContentType: contentType,
    })

    // Short expiry — a leaked presigned URL goes stale fast
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 })

    await prisma.lesson.update({
        where: { id: lessonId as string },
        data: { rawUploadKey: key, status: "UPLOADING" },
    })

    return res.status(200).json({
        success: true,
        message: "Upload URL generated",
        data: { 
            uploadUrl, 
            key 
        },
        error: null
    })
})


export const confirmUpload = asyncHandler(async (req, res) => {
    const { id: lessonId } = req.params

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId as string } })

    if (!lesson || !lesson.rawUploadKey) {
        return res.status(404).json({
            success: false, 
            data: null,
            message: "No pending upload found for this lesson",
            error: { 
                message: "Request an upload URL first." 
            }
        })
    }

    // Don't trust a client "I'm done" call — verify the object actually landed in R2
    let head
    try {
        head = await r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: lesson.rawUploadKey }))
    } catch {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Upload not found in storage",
            error: { 
                message: "The file does not appear to have finished uploading." 
            }
        })
    }

    const MAX_SIZE_BYTES = 2 * 1024 * 1024 * 1024 // 2GB cap
    if ((head.ContentLength ?? 0) > MAX_SIZE_BYTES) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "File too large",
            error: { 
                message: "Lecture videos must be under 2GB." 
            }
        })
    }

    // Option A: no transcoding — serve straight from R2/CDN via a public-but-namespaced path.
    // (We still gate the actual playback URL behind enrollment in the lesson-fetch endpoint,
    // same access-flag pattern as the course-details controller.)

    const updated = await prisma.lesson.update({
        where: { id: lessonId as string },
        data: { status: "READY" },
    })

    return res.status(200).json({
        success: true,
        message: "Video attached to lesson",
        data: updated,
        error: null,
    })
})