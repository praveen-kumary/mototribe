import { z } from "zod";

export const CreateOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const CreateOrderSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1, "Order must have at least one item"),
  shippingAddressId: z.string().min(1, "Shipping Address ID is required"),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Razorpay Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Razorpay Payment ID is required"),
  razorpay_signature: z.string().min(1, "Razorpay Signature is required"),
});

export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type VerifyPaymentDto = z.infer<typeof VerifyPaymentSchema>;
