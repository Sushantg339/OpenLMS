import { api, type ApiEnvelope } from "../api-client";

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
}

export const paymentService = {
  createOrder: (courseId: string) =>
    api
      .post<ApiEnvelope<CreateOrderResponse>>("/payments/create-order", { courseId })
      .then((r) => r.data.data),

  verify: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post("/payments/verify", data).then((r) => r.data.data),
};