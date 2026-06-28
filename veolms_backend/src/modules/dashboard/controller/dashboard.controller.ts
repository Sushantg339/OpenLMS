import { prisma } from "../../../lib/prisma.js"
import asyncHandler from "../../../utils/asyncHandler.js"
import { updateProgressSchema } from "../zod/dashboard.schema.js"

export const updateLessonProgress = asyncHandler(async (req, res) => {
    const userId = req.user!.id
    const { id: lessonId } = req.params

    const parsed = updateProgressSchema.safeParse(req.body)
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

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId as string },
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

    const courseId = lesson.section.course.id

    if (!lesson.isPreview) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { 
                userId_courseId: { 
                    userId, 
                    courseId 
                } 
            }
        })
        if (!enrollment) {
            return res.status(403).json({
                success: false, 
                data: null, message: "Access denied",
                error: { 
                    message: "You are not enrolled in this course." 
                }
            })
        }
    }

    const { watchedSeconds, completed } = parsed.data

    const existing = await prisma.lessonProgress.findUnique({
        where: { 
            userId_lessonId: { 
                userId, 
                lessonId: lessonId as string 
            } 
        }
    })

    // never let a late/out-of-order request rewind progress backwards
    const nextWatchedSeconds = Math.max(watchedSeconds, existing?.watchedSeconds ?? 0)

    const progress = await prisma.lessonProgress.upsert({
        where: { 
            userId_lessonId: { 
                userId, 
                lessonId: lessonId as string 
            } 
        },
        create: {
            userId,
            lessonId: lessonId as string,
            watchedSeconds: nextWatchedSeconds,
            completed: completed ?? false,
        },
        update: {
            watchedSeconds: nextWatchedSeconds,
            completed: completed ?? existing?.completed ?? false,
            lastWatchedAt: new Date(),
        },
    })

    return res.status(200).json({
        success: true, 
        message: "Progress updated", 
        data: progress, 
        error: null
    })
})

export const getContinueLearning = asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const recent = await prisma.lessonProgress.findMany({
        where: { 
            userId, 
            completed: false 
        },
        orderBy: { 
            lastWatchedAt: "desc" 
        },
        take: 10,
        select: {
            watchedSeconds: true,
            lastWatchedAt: true,
            lesson: {
                select: {
                    id: true, 
                    title: true, 
                    durationSeconds: true,
                    section: {
                        select: {
                            course: { 
                                select: { 
                                    id: true, 
                                    title: true, 
                                    slug: true, 
                                    thumbnailUrl: true 
                                } 
                            },
                        },
                    },
                },
            },
        }
    })

    return res.status(200).json({
        success: true, 
        message: "Continue learning fetched", 
        data: recent, 
        error: null
    })
})

export const getMyCourses = asyncHandler(async (req, res) => {
    const userId = req.user!.id

    const enrollments = await prisma.enrollment.findMany({
        where: { 
            userId 
        },
        select: {
            enrolledAt: true,
            course: {
                select: {
                    id: true, 
                    title: true, 
                    slug: true, 
                    thumbnailUrl: true,
                    sections: { 
                        select: { 
                            lessons: { 
                                select: { 
                                    id: true 
                                } 
                            } 
                        } 
                    },
                },
            },
        }
    })

    const courseIds = enrollments.map(e => e.course.id)

    const completedCounts = await prisma.lessonProgress.groupBy({
        by: ["lessonId"],
        where: { 
            userId, 
            completed: true 
        }
    })
    const completedLessonIds = new Set(completedCounts.map(c => c.lessonId))

    const result = enrollments.map(({ course, enrolledAt }) => {
        const lessonIds = course.sections.flatMap(s => s.lessons.map(l => l.id))
        const totalLessons = lessonIds.length
        const completedLessons = lessonIds.filter(id => completedLessonIds.has(id)).length

        return {
            id: course.id,
            title: course.title,
            slug: course.slug,
            thumbnailUrl: course.thumbnailUrl,
            enrolledAt,
            totalLessons,
            completedLessons,
            progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        }
    })

    return res.status(200).json({
        success: true, 
        message: "My courses fetched", 
        data: result, 
        error: null
    })
})