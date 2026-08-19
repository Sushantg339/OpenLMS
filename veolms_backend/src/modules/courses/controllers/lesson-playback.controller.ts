
import { prisma } from "../../../lib/prisma.js"
import asyncHandler from "../../../utils/asyncHandler.js"
import { generateVideoPlaybackToken } from "../../../utils/videoPlaybackToken.js"

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
                type: "external",
                courseSlug: lesson.section.course.slug,
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

    if (!lesson.hlsKey) {
        return res.status(409).json({
            success: false,
            data: null,
            message: "HLS video not ready",
            error: {
                message: "The HLS version of this video is not available yet."
            }
        })
    }

    return res.status(200).json({
        success: true,
        message: "Video information fetched",
        data: {
            videoUrl: null,
            type: "hls",
            courseSlug: lesson.section.course.slug,
        },
        error: null
    })
})

export const getVideoPlaybackToken = asyncHandler(async (req, res) => {

    const { id: lessonId } = req.params

    const userId = req.user!.id
    const userRole = req.user!.role

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId as string,
        },
        include: {
            section: {
                include: {
                    course: true,
                },
            },
        },
    })

    if (!lesson) {
        return res.status(404).json({
            success: false,
            data: null,
            message: "Lesson not found",
            error: {
                message: "Lesson not found.",
            },
        })
    }

    if (lesson.status !== "READY") {
        return res.status(409).json({
            success: false,
            data: null,
            message: "Video not ready",
            error: {
                message: "This lesson's video isn't available yet.",
            },
        })
    }

    const courseId = lesson.section.course.id

    let hasAccess =
        lesson.isPreview ||
        userRole === "ADMIN"

    if (!hasAccess) {

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        })

        hasAccess = !!enrollment
    }

    if (!hasAccess) {
        return res.status(403).json({
            success: false,
            data: null,
            message: "Access denied",
            error: {
                message: "You need to purchase this course to watch this lesson.",
            },
        })
    }

    if (!lesson.hlsKey) {
        return res.status(409).json({
            success: false,
            data: null,
            message: "HLS video unavailable",
            error: {
                message: "This lesson has not been processed for playback yet.",
            },
        })
    }

    const token = generateVideoPlaybackToken(
        userId,
        lesson.id,
    )

    return res.status(200).json({
        success: true,
        message: "Video playback token generated",
        data: {
            token,
            expiresIn: 600,
        },
        error: null,
    })
})