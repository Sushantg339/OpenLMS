import jwt, { type JwtPayload } from "jsonwebtoken"
import type { Response } from "express" 

import envConfig from "../../../config/env.config.js"
import ApiError from "../../../utils/ApiError.js"
import client from "../../../config/redis.config.js"

const ACCESS_TOKEN_SECRET = envConfig.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = envConfig.REFRESH_TOKEN_SECRET

if(!ACCESS_TOKEN_SECRET){
    throw new ApiError(500, "Access token secret is missing")
}

if(!REFRESH_TOKEN_SECRET){
    throw new ApiError(500, "Refresh token secret is missing")
}

const ACCESS_TOKEN_TTL = 15 * 60 * 1000
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000

const NODE_ENV = envConfig.NODE_ENV

const isProd = NODE_ENV === "production"

export const generateToken = async ( id: string, res: Response)=>{
    const accessToken = jwt.sign({id}, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign({id}, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    const refreshTokenKey = `refresh_token:${id}`

    await client.setEx(refreshTokenKey, 7*24*60*60, refreshToken)
    
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: ACCESS_TOKEN_TTL,
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: REFRESH_TOKEN_TTL,
    })

    return {accessToken, refreshToken}
}

export const verifyRefreshToken = async(refreshToken : string)=>{
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload

        const refreshTokenKey = `refresh_token:${decoded.id}`
        const storedRefreshToken = await client.get(refreshTokenKey)

        if(storedRefreshToken !== refreshToken){
            return null
        }

        return decoded
    } catch (error) {
        return null
    }
}

export const generateAccessToken = (id: string, res: Response)=>{
    const accessToken = jwt.sign({id}, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV == "production" ? "lax" : "none",
        maxAge: 15*60*1000
    })
}

export const revokeRefreshToken = async(id: string)=>{
    await client.del(`refresh_token:${id}`)
}