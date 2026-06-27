import express from "express"
import { authMiddleware } from "../../auth/middlewares/auth.middleware.js"
import { createOrder, razorpayWebhook, verifyPayment } from "../controllers/payment.controller.js"

const paymentRouter = express.Router()

paymentRouter.post('/create-order', authMiddleware, createOrder)
paymentRouter.post('/verify', authMiddleware, verifyPayment)
paymentRouter.post('/webhook', razorpayWebhook)   // no authMiddleware — Razorpay calls this, not a logged-in browser

export default paymentRouter