import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentIntentDto, RazorpayWebhookPayload } from "./payments.dto";
import { PaymentGatewayService } from "./payment-gateway.service";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    private gateway: PaymentGatewayService,
  ) {}

  async createIntent(dto: CreatePaymentIntentDto) {
    try {
      const gatewayOrder = await this.gateway.createOrder({
        orderId: dto.orderId,
        amount: dto.amount,
        currency: dto.currency,
        receipt: dto.orderId,
      });

      const intent = await this.prisma.paymentIntent.create({
        data: {
          orderId: dto.orderId,
          amount: dto.amount,
          currency: dto.currency,
          provider: this.gateway.isConfigured ? "RAZORPAY" : "MOCK",
          providerOrderId: gatewayOrder.paymentGatewayOrderId,
          status: "PENDING",
        },
      });

      if (!this.gateway.isConfigured) {
        this.logger.log(`Mock payment auto-completing for order ${dto.orderId}`);
        setImmediate(() => {
          this.eventEmitter.emit("payment.succeeded", {
            orderId: dto.orderId,
            paymentIntentId: intent.id,
            transactionId: `mock_tx_${Date.now()}`,
          });
        });
      }

      return intent;
    } catch (err) {
      this.logger.error("Failed to create payment order", err);
      throw new InternalServerErrorException("Failed to initiate payment");
    }
  }

  async handleRazorpayWebhook(signature: string, rawBody: Buffer) {
    if (!this.gateway.isConfigured) {
      throw new BadRequestException("Live payment webhooks require Razorpay configuration");
    }

    const event = await this.gateway.handleWebhook(rawBody, signature);
    if (!event) {
      return { status: "ignored" };
    }

    if (event.event === "payment.captured" && event.payload.payment?.entity) {
      await this.processPaymentSuccess(event.payload.payment.entity);
    } else if (event.event === "payment.failed" && event.payload.payment?.entity) {
      await this.processPaymentFailure(event.payload.payment.entity);
    }

    return { status: "ok" };
  }

  private async processPaymentSuccess(paymentData: any) {
    return this.prisma.$transaction(async (tx) => {
      const transactionId = paymentData.id;
      const providerOrderId = paymentData.order_id;

      const existingTx = await tx.paymentTransaction.findUnique({
        where: { providerTransactionId: transactionId },
      });

      if (existingTx) {
        this.logger.log(`Payment transaction ${transactionId} already processed.`);
        return;
      }

      const intent = await tx.paymentIntent.findUnique({
        where: { providerOrderId },
      });

      if (!intent) {
        this.logger.error(`PaymentIntent not found for providerOrderId: ${providerOrderId}`);
        return;
      }

      await tx.paymentTransaction.create({
        data: {
          paymentIntentId: intent.id,
          providerTransactionId: transactionId,
          amount: paymentData.amount,
          status: "CAPTURED",
          metadata: paymentData,
        },
      });

      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: { status: "CAPTURED" },
      });

      this.eventEmitter.emit("payment.succeeded", {
        orderId: intent.orderId,
        paymentIntentId: intent.id,
        transactionId,
      });

      this.logger.log(
        `Payment ${transactionId} processed successfully for order ${intent.orderId}`,
      );
    });
  }

  private async processPaymentFailure(paymentData: any) {
    const providerOrderId = paymentData.order_id;

    const intent = await this.prisma.paymentIntent.findUnique({
      where: { providerOrderId },
    });

    if (intent) {
      await this.prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: "FAILED" },
      });

      this.eventEmitter.emit("payment.failed", {
        orderId: intent.orderId,
      });

      this.logger.log(`Payment failed for order ${intent.orderId}`);
    }
  }
}
