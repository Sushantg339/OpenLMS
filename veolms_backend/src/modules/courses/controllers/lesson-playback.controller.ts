import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2Client, R2_BUCKET } from "../../../lib/r2.js"
import { prisma } from "../../../lib/prisma.js"
import asyncHandler from "../../../utils/asyncHandler.js"

export const getLessonVideo = asyncHandler(async (req, res) => {
    const { id: lessonId } = req.params
    const userId = req.user!.id
    const userRole = req.user!.role

    const lesson = await prisma.lesson.findUnique({
        where: { 
            id: lessonId as string 
        },
        include: { 
            section: { 
                include: { 
                    course: true 
                } 
            } 
        }
    })

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

    if (lesson.status !== "READY") {
        return res.status(409).json({
            success: false, 
            data: null, 
            message: "Video not ready",
            error: { 
                message: "This lesson's video isn't available yet." 
            }
        })
    }

    const courseId = lesson.section.course.id

    let hasAccess = lesson.isPreview || userRole === "ADMIN"

    if (!hasAccess) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { 
                userId_courseId: { 
                    userId, 
                    courseId 
                } 
            }
        })
        hasAccess = !!enrollment
    }

    if (!hasAccess) {
        return res.status(403).json({
            success: false, 
            data: null, 
            message: "Access denied",
            error: { 
                message: "You need to purchase this course to watch this lesson." 
            }
        })
    }

    // Borrowed/external content (e.g. a YouTube lesson) — nothing to sign, just return the link
    if (!lesson.rawUploadKey && lesson.videoUrl) {
        return res.status(200).json({
            success: true, 
            message: "Video URL fetched",
            data: { 
                videoUrl: lesson.videoUrl, 
                type: "external" 
            },
            error: null
        })
    }

    if (!lesson.rawUploadKey) {
        return res.status(409).json({
            success: false, 
            data: null, 
            message: "No video attached",
            error: { 
                message: "This lesson has no video yet." 
            }
        })
    }

    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: lesson.rawUploadKey })
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 }) // 10 min

    return res.status(200).json({
        success: true,
        message: "Video URL fetched",
        data: { 
            videoUrl: signedUrl, 
            type: "signed", 
            expiresIn: 600 
        },
        error: null
    })
})