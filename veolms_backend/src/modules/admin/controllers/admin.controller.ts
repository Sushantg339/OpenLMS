import type { RequestHandler } from "express"


import asyncHandler from "../../../utils/asyncHandler.js"
import { prisma } from "../../../lib/prisma.js"
import { listStudentsSchema, listEnrollmentsSchema } from "../zod/admin.schema.js"

export const listStudents: RequestHandler = asyncHandler(async (req, res) => {
    const parsed = listStudentsSchema.safeParse(req.query)

    if (!parsed.success) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Invalid query params",
            error: parsed.error.issues.map(i => ({ 
                message: i.message, 
                code: i.code, 
                path: i.path 
            }))
        })
    }

    const { page, limit, search } = parsed.data

    const take = Number(limit) > 0 ? Number(limit) : 10
    const skip = Number(page) > 0 ? Number(page) : 0
    const safeTake = Math.min(take, 50)

    const where = {
        role: "STUDENT" as const,
        ...(search && {
            OR: [
                { 
                    name: { 
                        contains: search, 
                        mode: "insensitive" as const 
                    } 
                },
                { 
                    email: { 
                        contains: search, 
                        mode: "insensitive" as const 
                    } 
                }
            ]
        })
    }

    const [students, totalCount] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                _count: { select: { enrollments: true } },
            },
            orderBy: { 
                createdAt: "desc" 
            },
            take: safeTake,
            skip
        }),
        prisma.user.count({ where }),
    ])

    return res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        data: {
            students: students.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
                createdAt: s.createdAt,
                enrolledCourseCount: s._count.enrollments,
            })),
            totalCount,
            page: skip,
            limit: safeTake,
        },
        error: null,
    })
})

export const getStudentById: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = req.params

    const student = await prisma.user.findUnique({
        where: { id: id as string, role: "STUDENT" },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            enrollments: {
                orderBy: { enrolledAt: "desc" },
                select: {
                    enrolledAt: true,
                    course: { 
                        select: { 
                            id: true, 
                            title: true, 
                            slug: true 
                        } 
                    },
                    payment: { 
                        select: { 
                            amount: true, 
                            status: true, 
                            provider: true, 
                            createdAt: true 
                        } 
                    }
                }
            }
        }
    })

    if (!student) {
        return res.status(404).json({
            success: false, 
            data: null, 
            message: "Student not found",
            error: { 
                message: "No student found for this id." 
            }
        })
    }

    return res.status(200).json({
        success: true, 
        message: "Student fetched successfully", 
        data: student, 
        error: null
    })
})

export const listEnrollments: RequestHandler = asyncHandler(async (req, res) => {
    const parsed = listEnrollmentsSchema.safeParse(req.query)

    if (!parsed.success) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Invalid query params",
            error: parsed.error.issues.map(i => ({ 
                message: i.message, 
                code: i.code, path: 
                i.path 
            }))
        })
    }

    const { page, limit, courseId } = parsed.data

    const take = Number(limit) > 0 ? Number(limit) : 10
    const skip = Number(page) > 0 ? Number(page) : 0
    const safeTake = Math.min(take, 50)

    const where = { ...(courseId && { courseId }) }

    const [enrollments, totalCount] = await Promise.all([
        prisma.enrollment.findMany({
            where,
            select: {
                id: true,
                enrolledAt: true,
                user: { 
                    select: { 
                        id: true, 
                        name: true, 
                        email: true 
                    } 
                },
                course: { 
                    select: { 
                        id: true, 
                        title: true, 
                        slug: true 
                    } 
                },
                payment: { 
                    select: { 
                        amount: true, 
                        currency: true, 
                        status: true, 
                        provider: true 
                    } 
                }
            },
            orderBy: { 
                enrolledAt: "desc" 
            },
            take: safeTake,
            skip
        }),
        prisma.enrollment.count({ where })
    ])

    return res.status(200).json({
        success: true,
        message: "Enrollments fetched successfully",
        data: { 
            enrollments, 
            totalCount, 
            page: skip, 
            limit: safeTake 
        },
        error: null
    })
})