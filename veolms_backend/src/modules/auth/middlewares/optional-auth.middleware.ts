import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"

import envConfig from "../../../config/env.config.js"
import client from "../../../config/redis.config.js"
import { prisma } from "../../../lib/prisma.js"

const ACCESS_TOKEN_SECRET = envConfig.ACCESS_TOKEN_SECRET!

export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accessToken } = req.cookies

        if (!accessToken) return next()   // no token — proceed as an anonymous visitor

        const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as JwtPayload

        const cachedUser = await client.get(`user:${decoded.id}`)
        if (cachedUser) {
            req.user = JSON.parse(cachedUser)
            return next()
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, name: true, email: true, role: true },
        })

        if (user) {
            await client.setEx(`user:${user.id}`, 60 * 60, JSON.stringify(user))
            req.user = { id: String(user.id), name: user.name, email: user.email, role: user.role }
        }

        return next()
    } catch {
        // Expired/invalid/missing token — don't reject, just proceed as anonymous.
        // This is the key difference from authMiddleware: failure is not an error here.
        return next()
    }
}