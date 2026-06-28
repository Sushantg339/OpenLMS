import type { RequestHandler } from "express";


import asyncHandler from "../../../utils/asyncHandler.js";
import { createCourseSchema, updateCourseSchema } from "../zod/course.schema.js";
import { prisma } from "../../../lib/prisma.js";

export const createCourse: RequestHandler = asyncHandler(async (req , res)=>{
    const id = req.user?.id

    if(!id){
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            data: null,
            error:{
                message : "Unauthorized. Please Login/Signup."
            }
        })
    }

    const parsed = createCourseSchema.safeParse(req.body)

    if(!parsed.success){
        return res.status(400).json({
            success: false,
            data: null,
            message : "Invlid input data",
            error: parsed.error.issues.map(issue => ({
                message: issue.message, 
                code: issue.code, 
                path: issue.path
            }))
        })
    }

    const {title, description, price, thumbnailUrl, trailerVideoUrl, slug, instructorName} = parsed.data

    const existingCourse = await prisma.course.findUnique({
        where: {slug}
    })

    if(existingCourse){
        return res.status(409).json({
            success: false,
            message : "Course slug already exists.",
            data: null,
            error: {
                message : "Choose a different slug."
            }
        })
    }

    const course = await prisma.course.create({
        data : {
            title,
            instructorName,
            price,
            slug,
            createdBy: id as string,
            isPublished: false,

            ...(description && { description }),
            ...(thumbnailUrl && { thumbnailUrl }),
            ...(trailerVideoUrl && { trailerVideoUrl }),
        }, 
        select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            instructorName: true,
            isPublished: true,
            createdAt: true,
        },
    })

    return res.status(201).json({
        success: true,
        message: "Course created successfully.",
        data: course,
        error: null,
    });
})

export const fetchCourses : RequestHandler = asyncHandler(async(req , res)=>{

    const {page, limit, search} = req.query

    const courses = await prisma.course.findMany({
        where:{
            isPublished: true,
            ...(search && {
                title: { contains: String(search), mode: "insensitive" },
            })
        },
        select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            instructorName: true,
            isPublished: true,
            createdAt: true,
            thumbnailUrl: true,
            description: true,
            trailerVideoUrl: true
        },
        take: Number(limit) > 0 ? Number(limit) : 10,
        skip: Number(page) > 0 ? Number(page) : 0,
        orderBy: { createdAt: "desc" },
    })

    return res.status(200).json({
        success: true,
        message : "All courses fetched successsfully",
        data: courses,
        error: null
    })
})

export const fetchCourseDetails: RequestHandler = asyncHandler(async (req, res) => {
    const { slug } = req.params

    const course = await prisma.course.findUnique({
        where: { slug: slug as string, isPublished: true },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnailUrl: true,
            trailerVideoUrl: true,
            price: true,
            instructorName: true,
            createdAt: true,
            sections: {
                orderBy: { orderIndex: "asc" },
                select: {
                    id: true,
                    title: true,
                    orderIndex: true,
                    lessons: {
                        orderBy: { orderIndex: "asc" },
                        select: {
                            id: true,
                            title: true,
                            durationSeconds: true,
                            isPreview: true,
                            orderIndex: true,
                            videoUrl: true, // stripped below before responding
                        },
                    },
                },
            },
        },
    })

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
            error: { message: "No course found for this slug." },
        })
    }

    // Strip real video URLs for non-preview lessons unless the requester is enrolled.
    // req.user is populated by an *optional*-auth middleware on this route (no auth required to view).
    let isEnrolled = false
    if (req.user) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
        })
        isEnrolled = !!enrollment
    }

    const sections = course.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map(({ videoUrl, ...lesson }) => ({
            ...lesson,
            hasAccess: lesson.isPreview || isEnrolled,
            // never send videoUrl here at all — fetched separately via an authenticated,
            // access-checked endpoint once hasAccess is true
        })),
    }))

    return res.status(200).json({
        success: true,
        message: "Course details fetched successfully",
        data: { ...course, sections },
        error: null,
    })
})

export const updateCourseDetails = asyncHandler(async(req , res)=>{
    const parsed = updateCourseSchema.safeParse(req.body)
    
    if(!parsed.success){
        return res.status(400).json({
            success: false,
            data: null,
            message : "Invlid input data",
            error: parsed.error.issues.map(issue => ({
                message: issue.message, 
                code: issue.code, 
                path: issue.path
            }))
        })
    }

    const {title, description, price, thumbnailUrl, trailerVideoUrl, isPublished, instructorName} = parsed.data
    
    const {id} = req.params

    const course = await prisma.course.findUnique({
        where : {
            id: id as string
        }
    })

    if(!course){
        return res.status(404).json({
            success: false,
            message : "Course not found",
            data: null,
            error: {
                message : "Course not found."
            } 
        })
    }

    const updateData = {
        title : title ?? course.title,
        description: description ?? course.description,
        price: price ?? course.price,
        thumbnailUrl: thumbnailUrl ?? course.thumbnailUrl,
        trailerVideoUrl: trailerVideoUrl ?? course.trailerVideoUrl,
        isPublished : isPublished ?? course.isPublished,
        instructorName: instructorName ?? course.instructorName
    }

    const updatedCourse = await prisma.course.update({
        where: {id: id as string},
        data: updateData,
        select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            instructorName: true,
            isPublished: true,
            createdAt: true,
        }
    })

    return res.status(200).json({
        success: true,
        message : "Course updated successfully",
        data: updatedCourse,
        error: null
    })
})

export const fetchAllCourses: RequestHandler = asyncHandler(async (req , res)=>{
    const courses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            instructorName: true,
            isPublished: true,
            createdAt: true,
        }
    })

    return res.status(200).json({
        success: true,
        message : "All courses fetched successfully",
        data : courses,
        error: null
    })
})

export const deleteCourse = asyncHandler(async (req, res) => {
    const { id } = req.params

    const course = await prisma.course.findUnique({ where: { id: id as string } })

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
            error: { message: "Course not found." },
        })
    }

    const updatedCourse = await prisma.course.update({
        where: { id: id as string },
        data: { isPublished: false },
    })

    return res.status(200).json({
        success: true,
        message: "Course unpublished successfully",
        data: updatedCourse,
        error: null,
    })
})

export const fetchCourseById: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = req.params

    const course = await prisma.course.findUnique({
        where: { id: id as string },   // no isPublished filter — admin needs to see drafts too
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnailUrl: true,
            trailerVideoUrl: true,
            price: true,
            instructorName: true,
            isPublished: true,
            createdAt: true,
            sections: {
                orderBy: { orderIndex: "asc" },
                select: {
                    id: true,
                    title: true,
                    orderIndex: true,
                    lessons: {
                        orderBy: { orderIndex: "asc" },
                        select: {
                            id: true,
                            title: true,
                            videoUrl: true,        // fine to expose here — admin-only route, unlike the public one
                            status: true,
                            durationSeconds: true,
                            isPreview: true,
                            orderIndex: true,
                            // rawUploadKey intentionally omitted — it's an internal storage pointer,
                            // not something the admin UI needs to render or edit
                        },
                    },
                },
            },
        },
    })

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
            error: { message: "No course found for this id." },
        })
    }

    return res.status(200).json({
        success: true,
        message: "Course fetched successfully",
        data: course,
        error: null,
    })
})