import Razorpay from "razorpay"
import envConfig from "../config/env.config.js"
import ApiError from "../utils/ApiError.js"

const RAZORPAY_KEY_ID = envConfig.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET= envConfig.RAZORPAY_KEY_SECRET

if(!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET){
    throw new ApiError(500, "Missing razorpay configuration")
}

export const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
})