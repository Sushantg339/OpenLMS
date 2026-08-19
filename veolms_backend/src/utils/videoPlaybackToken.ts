import jwt, { type JwtPayload } from "jsonwebtoken"

import envConfig from "../config/env.config.js"
import ApiError from "./ApiError.js"

const ACCESS_TOKEN_SECRET = envConfig.ACCESS_TOKEN_SECRET

if (!ACCESS_TOKEN_SECRET) {
    throw new ApiError(500, "Access token secret is missing")
}

const VIDEO_TOKEN_TTL = "10m"

export const generateVideoPlaybackToken = (
    userId: string,
    lessonId: string,
) => {
    return jwt.sign(
        {
            type: "video-playback",
            userId,
            lessonId,
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: VIDEO_TOKEN_TTL,
        }
    )
}

export const verifyVideoPlaybackToken = (
    token: string,
): JwtPayload | null => {

    try {

        const decoded = jwt.verify(
            token,
            ACCESS_TOKEN_SECRET
        ) as JwtPayload

        if (
            decoded.type !== "video-playback" ||
            typeof decoded.userId !== "string" ||
            typeof decoded.lessonId !== "string"
        ) {
            return null
        }

        return decoded

    } catch {
        return null
    }
}