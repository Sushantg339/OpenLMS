import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "crypto"

import { r2Client, R2_BUCKET } from "../../../lib/r2.js"
import { prisma } from "../../../lib/prisma.js"
import asyncHandler from "../../../utils/asyncHandler.js"
import envConfig from "../../../config/env.config.js"

const R2_PUBLIC_BASE_URL = envConfig.R2_PUBLIC_BASE_URL

const uploadToR2 = async (key: string, buffer: Buffer, contentType: string) => {
    await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    }))
    return `${R2_PUBLIC_BASE_URL}/${key}`
}

export const uploadCourseThumbnail = asyncHandler(async (req, res) => {
    const { id: courseId } = req.params
    const file = req.file

    if (!file) {
        return res.status(400).json({
            success: false,
            data: null, 
            message: "No file provided",
            error: { 
                message: "Attach an image file under the 'thumbnail' field." 
            }
        })
    }

    const course = await prisma.course.findUnique({ where: { id: courseId as string } })
    if (!course) {
        return res.status(404).json({
            success: false, 
            data: null, 
            message: "Course not found",
            error: { 
                message: "No course found for this id." 
            }
        })
    }

    const ext = file.mimetype.split("/")[1]
    const key = `thumbnails/${courseId}/${randomUUID()}.${ext}`
    const publicUrl = await uploadToR2(key, file.buffer, file.mimetype)

    // clean up the old thumbnail so it doesn't sit around as a storage-cost leak
    if (course.thumbnailUrl) {
        const oldKey = course.thumbnailUrl.replace(`${R2_PUBLIC_BASE_URL}/`, "")
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: oldKey })).catch(() => {})
    }

    const updated = await prisma.course.update({
        where: { 
            id: courseId as string 
        },
        data: { 
            thumbnailUrl: publicUrl 
        },
        select: { 
            id: true, 
            thumbnailUrl: true 
        }
    })

    return res.status(200).json({
        success: true, 
        message: "Thumbnail uploaded", 
        data: updated, 
        error: null
    })
})

export const uploadCourseTrailer = asyncHandler(async (req, res) => {
    const { id: courseId } = req.params
    const file = req.file

    if (!file) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "No file provided",
            error: { 
                message: "Attach a video file under the 'trailer' field." 
            }
        })
    }

    const course = await prisma.course.findUnique({ where: { id: courseId as string } })
    if (!course) {
        return res.status(404).json({
            success: false, 
            data: null, 
            message: "Course not found",
            error: { 
                message: "No course found for this id." 
            }
        })
    }

    const ext = file.mimetype.split("/")[1]
    const key = `trailers/${courseId}/${randomUUID()}.${ext}`
    const publicUrl = await uploadToR2(key, file.buffer, file.mimetype)

    if (course.trailerVideoUrl) {
        const oldKey = course.trailerVideoUrl.replace(`${R2_PUBLIC_BASE_URL}/`, "")
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: oldKey })).catch(() => {})
    }

    const updated = await prisma.course.update({
        where: { 
            id: courseId as string 
        },
        data: { 
            trailerVideoUrl: publicUrl 
        },
        select: { 
            id: true, 
            trailerVideoUrl: true 
        }
    })

    return res.status(200).json({
        success: true, 
        message: "Trailer uploaded", 
        data: updated, 
        error: null
    })
})