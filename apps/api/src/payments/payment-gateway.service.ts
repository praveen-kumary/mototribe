/**
 * Razorpay Payment Gateway — live SDK when configured, safe mock otherwise.
 */

import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

const Razorpay = require("razorpay");

export interface CreatePaymentOrderInput {
  orderId: string;
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  paymentGatewayOrderId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface WebhookEvent {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string; status: string; amount: number } };
    order?: { entity: { id: string; status: string } };
  };
}

export interface RefundInput {
  paymentId: string;
  amount: number;
  reason?: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly razorpay: any;

  constructor(private config: ConfigService) {
    const keyId = this.config.get("RAZORPAY_KEY_ID");
    const keySecret = this.config.get("RAZORPAY_KEY_SECRET");
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    } else {
      this.logger.warn("Razorpay credentials not configured — running in MOCK payment mode");
    }
  }

  get isConfigured(): boolean {
    return !!this.razorpay;
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    if (!this.isConfigured) {
      return {
        paymentGatewayOrderId: `mock_order_${input.orderId}_${Date.now()}`,
        amount: input.amount,
        currency: input.currency || "INR",
        status: "created",
      };
    }

    const order = await this.razorpay.orders.create({
      amount: input.amount,
      currency: input.currency || "INR",
      receipt: input.receipt || input.orderId,
      notes: input.notes,
    });

    return {
      paymentGatewayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    if (!this.isConfigured) return true;

    const keySecret = this.config.get<string>("RAZORPAY_KEY_SECRET");
    const expectedSignature = crypto
      .createHmac("sha256", keySecret!)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest("hex");

    return expectedSignature === input.razorpaySignature;
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<WebhookEvent | null> {
    if (!this.isConfigured) return null;

    const secret = this.config.get<string>("RAZORPAY_WEBHOOK_SECRET");
    if (!secret) {
      throw new BadRequestException("RAZORPAY_WEBHOOK_SECRET is not configured");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new BadRequestException("Invalid webhook signature");
    }

    return JSON.parse(rawBody.toString()) as WebhookEvent;
  }

  async refund(input: RefundInput): Promise<{ refundId: string; status: string }> {
    if (!this.isConfigured) {
      return { refundId: `mock_refund_${Date.now()}`, status: "processed" };
    }

    const refund = await this.razorpay.payments.refund(input.paymentId, {
      amount: input.amount,
      notes: { reason: input.reason },
    });

    return { refundId: refund.id, status: refund.status };
  }
}
