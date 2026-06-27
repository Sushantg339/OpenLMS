import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"


import envConfig from "../../../config/env.config.js";
import ApiError from "../../../utils/ApiError.js";
import client from "../../../config/redis.config.js";
import { prisma } from "../../../lib/prisma.js";

const ACCESS_TOKEN_SECRET = envConfig.ACCESS_TOKEN_SECRET

if(!ACCESS_TOKEN_SECRET){
    throw new ApiError(500, "Access token secret is missing")
}

declare global{
    namespace Express{
        interface Request{
            user?:{
                id: string,
                name: string,
                email: string,
                role: string
            }
        }
    }
}

export const authMiddleware = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const {accessToken} = req.cookies

        if(!accessToken){
            return res.status(401).json({
                success: false,
                message: "Access Token missing or expired.",
                data: null,
                error: {
                    message: "Invalid access token"
                }
            })
        }

        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as JwtPayload

        if(!decoded){
            return res.status(401).json({
                success: false,
                message: "Invalid Token. Login again",
                data: null,
                error:{
                    message : "Invalid token, please login again"
                }
            })
        }

        const cachedUser = await client.get(`user:${decoded.id}`)

        if(cachedUser){
            req.user = JSON.parse(cachedUser)
            return next()
        }

        const user = await prisma.user.findUnique({
            where: {id: decoded.id},
            select:{
                id: true,
                name: true,
                email: true, 
                role: true
            }
        })

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid Token. Login again",
                data: null,
                error:{
                    message : "Invalid token, please login again"
                }
            })
        }

        await client.setEx(`user:${user.id}`, 60*60, JSON.stringify(user))

        req.user = {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role
        }

        next()
    } catch (error) {
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            data: null,
            error:{
                message: "Unauthorized"
            }
        })
    }
}

export const requireRole = (...allowedRoles : string[])=>{
    return (req: Request, res: Response, next: NextFunction)=>{
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                data: null,
                error: {
                message: "Authentication required",
                },
            });
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "Forbidden",
                data: null,
                error: {
                message: "You do not have permission to access this resource",
                },
            });
        }

        next()
    } 
}