import type { RequestHandler } from "express";

import asyncHandler from "../../../utils/asyncHandler.js";
import { createSectionSchema, reorderSectionSchema, updateSectionSchema } from "../zod/section.schema.js";
import { prisma } from "../../../lib/prisma.js";

export const createSection: RequestHandler = asyncHandler(async(req , res)=>{
    const {courseId} = req.params

    if(!courseId || !(typeof courseId == "string")){
        return res.status(400).json({
            success: false,
            message : "Invalid params recieved",
            data: null,
            error:{
                message : "Course id is not valid."
            }
        })
    }
    
    const parsed = createSectionSchema.safeParse(req.body)

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

    const course = await prisma.course.findUnique({ where: { id: courseId } })

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found",
            data: null,
            error: { message: "No course found for the given courseId." },
        })
    }

    const {title, orderIndex} = parsed.data

    const existingSection = await prisma.section.findFirst({
        where: { courseId, orderIndex }
    })

    if (existingSection) {
        return res.status(409).json({
            success: false,
            message: "A section already exists at this position",
            data: null,
            error: { message: "Choose a different orderIndex, or use the reorder endpoint." },
        })
    }

    const section = await prisma.section.create({
        data : {
            courseId,
            title,
            orderIndex
        }
    })

    return res.status(201).json({
        success: true,
        message : "Section created successfully",
        data : section,
        error: null
    })
})

export const updateSectionDetails: RequestHandler = asyncHandler(async (req , res)=>{
    const {id} = req.params

    const parsed = updateSectionSchema.safeParse(req.body)

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

    const {title, orderIndex} = parsed.data

    const section = await prisma.section.findUnique({
        where: { id: id as string }
    })

    if(!section){
        return res.status(404).json({
            success: false,
            message : "Invalid section id",
            data: null,
            error:{
                message: "Section not found."
            }
        })
    }

    const updateData = {
        title: title ?? section.title,
        orderIndex: orderIndex ?? section.orderIndex
    }

    const updatedSection = await prisma.section.update({
        where:{
            id: id as string
        },
        data: updateData
    })

    return res.status(200).json({
        success: true,
        message : "Successfully updated the section",
        data: updatedSection,
        error: null
    })
})

export const deleteSection = asyncHandler(async (req, res) => {
    const { id } = req.params

    const section = await prisma.section.findUnique({ where: { id: id as string } })

    if (!section) {
        return res.status(404).json({
            success: false,
            message: "Section not found",
            data: null,
            error: { message: "Section not found." },
        })
    }

    try {
        await prisma.section.delete({ where: { id: id as string } })
    } catch (err: any) {
        if (err.code === "P2003") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this section",
                data: null,
                error: { message: "One or more lessons in this section have student progress recorded. Unpublish the course instead of deleting this section." },
            })
        }
        throw err
    }

    return res.status(200).json({
        success: true,
        message: "Section deleted successfully",
        data: null,
        error: null,
    })
})

export const reorderSections: RequestHandler = asyncHandler(async (req, res) => {
    const { courseId } = req.params


    const parsed = reorderSectionSchema.safeParse(req.body)

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

    const { sections } = parsed.data

    await prisma.$transaction(
        sections.map(({ id, orderIndex }) =>
            prisma.section.update({
                where: { 
                    id, 
                    courseId: courseId as string 
                },
                data: { orderIndex },
            })
        )
    )

    return res.status(200).json({
        success: true,
        message: "Sections reordered successfully",
        data: null,
        error: null,
    })
})