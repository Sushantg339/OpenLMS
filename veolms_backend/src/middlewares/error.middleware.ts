import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

import ApiError from "../utils/ApiError.js";

const isDevelopment = process.env.NODE_ENV === "development";

const isPrismaError = ( err: unknown ): err is { code: string; message: string } => {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
    );
};

const sendErrorDev = (err: ApiError, res: Response) => {
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        status: err.status,
        stack: err.stack,
    });
};

const sendErrorProd = (err: ApiError, res: Response) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        });
    }

    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};

export const errorHandler = ( err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    let error: ApiError;

    if (isPrismaError(err)) {
        switch (err.code) {
            case "P2002":
                error = new ApiError(409, "Resource already exists.");
                break;

            case "P2025":
                error = new ApiError(404, "Resource not found.");
                break;

            case "P2003":
                error = new ApiError(400, "Foreign key constraint failed.");
                break;

            default:
                error = new ApiError(500, err.message);
                error.isOperational = false;
        }
    }

    /**
     * Custom ApiError
     */
    if (err instanceof ApiError) {
        error = err;
    }

    /**
     * JWT Invalid Token
     */
    else if (err instanceof jwt.JsonWebTokenError) {
        error = new ApiError(401, "Invalid token.");
    }

    /**
     * JWT Expired Token
     */
    else if (err instanceof jwt.TokenExpiredError) {
        error = new ApiError(401, "Token has expired.");
    }

    /**
     * Zod Validation Error
     */
    else if (err instanceof ZodError) {
        error = new ApiError(
        400,
        err.issues.map(issue => issue.message).join(", ")
        );
    }

    /**
     * Native Error
     */
    else if (err instanceof Error) {
        error = new ApiError(500, err.message);
        error.isOperational = false;
    }

    /**
     * Unknown Error
     */
    else {
        error = new ApiError(500, "Internal Server Error");
        error.isOperational = false;
    }

    if (isDevelopment) {
        return sendErrorDev(error, res);
    }

    return sendErrorProd(error, res);
};

export default errorHandler;