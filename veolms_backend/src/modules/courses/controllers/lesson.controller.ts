import type { RequestHandler } from "express";

import asyncHandler from "../../../utils/asyncHandler.js";
import { createLessonSchema, reorderLessonSchema, updateLessonSchema } from "../zod/lesson.schema.js";
import { prisma } from "../../../lib/prisma.js";

export const createLesson: RequestHandler = asyncHandler(async(req , res)=>{
    const {sectionId} = req.params

    const parsed = createLessonSchema.safeParse(req.body)

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

    const {title, isPreview, orderIndex, videoUrl} = parsed.data

    const section = await prisma.section.findUnique({ where: { id: sectionId as string } })

    if (!section) {
        return res.status(404).json({
            success: false,
            message: "Section not found",
            data: null,
            error: { message: "No section found for the given sectionId." },
        })
    }

    const existingLesson = await prisma.lesson.findUnique({
        where: {
            sectionId_orderIndex: {
                sectionId: sectionId as string,
                orderIndex,
            },
        },
    });

    if(existingLesson){
        return res.status(409).json({
            success: false,
            message: "Lesson already exists",
            data: null,
            error:{
                message : "Change the section or order index"
            }
        })
    }

    const lesson = await prisma.lesson.create({
        data:{
            title,
            isPreview: isPreview || false,
            orderIndex,
            sectionId: sectionId as string,
            ...(videoUrl && { videoUrl, status: "READY" }),
        }
    })

    return res.status(201).json({
        success: true,
        message : "Lesson created successfully",
        data: lesson,
        error: null
    })
})


export const updateLessonDetails: RequestHandler = asyncHandler(async(req , res)=>{
    const {id} = req.params

    const parsed = updateLessonSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            data: null,
            message: "Invalid input data",
            error: parsed.error.issues.map(issue => ({ 
                message: issue.message, 
                code: issue.code, 
                path: issue.path 
            })),
        })
    }

    const {title, isPreview, orderIndex, videoUrl} = parsed.data

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: id as string
        }
    })

    if(!lesson){
        return res.status(404).json({
            success: false,
            message : "Invalid lesson Id",
            data: null,
            error: {
                message : "Lesson not found."
            }
        })
    }

    if (videoUrl && lesson.rawUploadKey) {
        return res.status(409).json({
            success: false, 
            data: null, 
            message: "Cannot set an external URL on this lesson",
            error: { 
                message: "This lesson already has an uploaded video. Remove it first, or create a new lesson for external content." 
            }
        })
    }

    const updateData = {
        title: title ?? lesson.title,
        isPreview: isPreview ?? lesson.isPreview,
        orderIndex: orderIndex ?? lesson.orderIndex,
        videoUrl: videoUrl ?? lesson.videoUrl,
        ...(videoUrl && { status: "READY" as const })
    }

    const updatedLesson = await prisma.lesson.update({
        where:{
            id: id as string
        },
        data: updateData
    })

    return res.status(200).json({
        success: true,
        message : "Lesson updated successfully",
        data: updatedLesson,
        error: null
    })
})

export const deleteLesson: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = req.params

    const lesson = await prisma.lesson.findUnique({ where: { id: id as string } })

    if (!lesson) {
        return res.status(404).json({
            success: false,
            message: "Lesson not found",
            data: null,
            error: { message: "Lesson not found." },
        })
    }

    try {
        await prisma.lesson.delete({ where: { id: id as string } })
    } catch (err: any) {
        if (err.code === "P2003") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this lesson",
                data: null,
                error: { message: "Students have recorded progress on this lesson. Unpublish the course instead." },
            })
        }
        throw err
    }

    return res.status(200).json({
        success: true,
        message: "Lesson deleted successfully",
        data: null,
        error: null,
    })
})


export const reorderLessons: RequestHandler = asyncHandler(async (req, res) => {
    const { sectionId } = req.params


    const parsed = reorderLessonSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            data: null,
            message: "Invalid input data",
            error: parsed.error.issues.map(issue => ({ 
                message: issue.message, 
                code: issue.code, 
                path: issue.path 
            })),
        })
    }

    const { lessons } = parsed.data

    await prisma.$transaction(
        lessons.map(({ id, orderIndex }) =>
            prisma.lesson.update({
                where: { 
                    id, 
                    sectionId: sectionId as string 
                },
                data: { orderIndex },
            })
        )
    )

    return res.status(200).json({
        success: true,
        message: "Lessons reordered successfully",
        data: null,
        error: null,
    })
})