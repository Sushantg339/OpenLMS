import type { RequestHandler } from "express";
import bcrypt from "bcrypt"

import asyncHandler from "../../../utils/asyncHandler.js";
import { loginSchema, signupSchema } from "../zod/auth.schema.js";
import { prisma } from "../../../lib/prisma.js";
import ApiError from "../../../utils/ApiError.js";
import { generateAccessToken, generateToken, revokeRefreshToken, verifyRefreshToken } from "../lib/token.js";
import client from "../../../config/redis.config.js";


export const signupController: RequestHandler = asyncHandler(async(req, res)=>{
    const parsed = signupSchema.safeParse(req.body)

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

    const {name, email, password} = parsed.data

    const existingUser = await prisma.user.findUnique({
        where: {email}
    })

    if(existingUser){
        throw new ApiError(409, "User already exists")
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data:{
            name,
            email,
            passwordHash
        }
    })

    return res.status(201).json({
        success: true,
        data:{
            name: user.name,
            email: user.email,
            role: user.role,
            id: user.id
        },
        error: null
    })
})

export const loginController: RequestHandler = asyncHandler(async(req , res)=>{
    const parsed = loginSchema.safeParse(req.body)

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

    const {password, email} = parsed.data

    const user = await prisma.user.findUnique({
        where:{email}
    })

    if(!user){
        throw new ApiError(400, "Invalid credentials")
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid credentials")
    }

    await generateToken(user.id, res)

    return res.status(200).json({
        success: true,
        message: `${user.name} logged in successfully`,
        data:{
            name: user.name,
            email: user.email,
            role: user.role,
            id: user.id
        },
        error: null
    })
})

export const refreshAccessToken = asyncHandler(async(req , res)=>{
    const {refreshToken} = req.cookies

    if(!refreshToken){
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token",
            data: null,
            error: {
                message: "Refresh token missing"
            }
        })
    }

    const decoded = await verifyRefreshToken(refreshToken)

    if(!decoded){
        res.clearCookie("refreshToken")
        res.clearCookie("accessToken")

        return res.status(401).json({
            success: false,
            message: "Invalid refresh token",
            data: null,
            error:{
                message  : "refresh token invalid."
            }
        })
    }

    generateAccessToken(decoded.id, res)

    return res.status(200).json({
        success: true,
        message: "Successfully updated the access token",
        data: decoded,
        error: null
    })
})

export const logoutController: RequestHandler = asyncHandler(async(req , res)=>{
    const {id, name} = req.user!

    if(!id || !name){
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            data: null,
            error:{
                message : "Unauthorized. Please Login/Signup."
            }
        })
    }

    await revokeRefreshToken(id)

    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")

    await client.del(`user:${id}`)

    return res.status(200).json({
        success: true,
        message : `${name} logged out successfully`,
        data: req.user!
    })
})