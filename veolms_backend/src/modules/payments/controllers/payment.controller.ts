import crypto from "crypto"

import { razorpay } from "../../../lib/razorpay.js"
import { prisma } from "../../../lib/prisma.js"
import asyncHandler from "../../../utils/asyncHandler.js"
import { createOrderSchema } from "../zod/payment.schema.js"
import envConfig from "../../../config/env.config.js"
import { verifyPaymentSchema } from "../zod/payment.schema.js"
import ApiError from "../../../utils/ApiError.js"

const RAZORPAY_KEY_ID = envConfig.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = envConfig.RAZORPAY_KEY_SECRET
const RAZORPAY_WEBHOOK_SECRET = envConfig.RAZORPAY_WEBHOOK_SECRET

if(!RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET || !RAZORPAY_KEY_ID){
    throw new ApiError(500, "Missing razorpay configuration")
}

export const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user!.id
    const parsed = createOrderSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Invalid input data",
            error: parsed.error.issues.map(i => ({ 
                message: i.message, 
                code: i.code, 
                path: i.path 
            }))
        })
    }

    const { courseId } = parsed.data

    const course = await prisma.course.findUnique({ where: { id: courseId, isPublished: true } })

    if (!course) {
        return res.status(404).json({
            success: false, 
            data: null, 
            message: "Course not found",
            error: { 
                message: "No published course found for this id." 
            }
        })
    }

    // Block double-purchase up front
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: { 
            userId_courseId: { userId, courseId } 
        }
    })

    if (existingEnrollment) {
        return res.status(409).json({
            success: false, 
            data: null, 
            message: "Already enrolled",
            error: { 
                message: "You are already enrolled in this course." 
            }
        })
    }

    const existingPayment = await prisma.payment.findFirst({
        where: {
            courseId,
            userId,
            status: "CREATED"
        }
    })

    if(existingPayment){
        return res.status(200).json({
        success: true,
        message: "Pending order found",
        data: {
            orderId: existingPayment.providerOrderId,
            amount: course.price,
            currency: "INR",
            keyId: RAZORPAY_KEY_ID,   // public key — safe to send to frontend
            paymentId: existingPayment.id,
        },
        error: null
    })
    }

    // Price comes from the DB, never from the client — never trust a client-sent amount
    const razorpayOrder = await razorpay.orders.create({
        amount: course.price,
        currency: "INR",
        notes: { courseId, userId }
    })

    const payment = await prisma.payment.create({
        data: {
            userId,
            courseId,
            provider: "RAZORPAY",
            providerOrderId: razorpayOrder.id,
            amount: course.price,
            status: "CREATED",
        }
    })

    return res.status(201).json({
        success: true,
        message: "Order created",
        data: {
            orderId: razorpayOrder.id,
            amount: course.price,
            currency: "INR",
            keyId: RAZORPAY_KEY_ID,   // public key — safe to send to frontend
            paymentId: payment.id,
        },
        error: null
    })
})



export const verifyPayment = asyncHandler(async (req, res) => {
    const userId = req.user!.id
    const parsed = verifyPaymentSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Invalid input data",
            error: parsed.error.issues.map(i => ({ 
                message: i.message, 
                code: i.code, 
                path: i.path 
            }))
        })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data

    const payment = await prisma.payment.findFirst({
        where: { 
            providerOrderId: 
            razorpay_order_id, 
            userId 
        }
    })

    if (!payment) {
        return res.status(404).json({
            success: false, 
            data: null, 
            message: "Payment record not found",
            error: { 
                message: "No matching payment found for this order." 
            }
        })
    }

    if (payment.status === "PAID") {
        // Already processed (e.g. webhook beat the client here) — idempotent response, not an error
        return res.status(200).json({
            success: true, 
            message: "Payment already verified", 
            data: { status: "PAID" }, 
            error: null
        })
    }

    // The actual security check — recompute the signature ourselves
    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex")

    if (expectedSignature !== razorpay_signature) {
        await prisma.payment.update({ 
            where: { 
                id: payment.id 
            }, 
            data: { 
                status: "FAILED" 
            } 
        })

        return res.status(400).json({
            success: false, 
            data: null, 
            message: "Payment verification failed",
            error: { 
                message: "Signature mismatch." 
            }
        })
    }

    // Signature is valid — mark paid and enroll, atomically
    const enrollment = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
            where: { 
                id: payment.id 
            },
            data: { 
                status: "PAID", 
                providerPaymentId: razorpay_payment_id 
            }
        })

        return tx.enrollment.create({
            data: {
                userId: payment.userId,
                courseId: payment.courseId,
                paymentId: updatedPayment.id,
            },
        })
    })

    return res.status(200).json({
        success: true,
        message: "Payment verified, enrollment created",
        data: enrollment,
        error: null,
    })
})

// This route needs RAW body parsing, not JSON-parsed — configure separately, see note below
export const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"] as string

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(req.body) // raw Buffer, not parsed JSON — see note
        .digest("hex")

    if (signature !== expectedSignature) {
        return res.status(400).json({ success: false, message: "Invalid webhook signature" })
    }

    const event = JSON.parse(req.body.toString())

    if (event.event === "payment.captured") {
        const orderId = event.payload.payment.entity.order_id
        const paymentId = event.payload.payment.entity.id

        const payment = await prisma.payment.findFirst({ where: { providerOrderId: orderId } })

        if (payment && payment.status !== "PAID") {
            await prisma.$transaction(async (tx) => {
                const updated = await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: "PAID", providerPaymentId: paymentId },
                })
                await tx.enrollment.create({
                    data: { userId: payment.userId, courseId: payment.courseId, paymentId: updated.id },
                })
            })
        }
    }

    return res.status(200).json({ success: true })
})