import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OutboxService } from "../outbox/outbox.service";
import { OnEvent } from "@nestjs/event-emitter";
import { OrderStatus } from "@prisma/client";
import { OrderAggregate } from "./order.aggregate";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private outbox: OutboxService,
  ) {}

  @OnEvent("payment.succeeded")
  async handlePaymentSucceeded(event: { orderId: string; transactionId: string }) {
    this.logger.log(`Received payment.succeeded for order ${event.orderId}`);
    await this.transitionOrderStatus(
      event.orderId,
      "CONFIRMED",
      "SYSTEM",
      "Payment successful",
    );
  }

  @OnEvent("payment.failed")
  async handlePaymentFailed(event: { orderId: string }) {
    this.logger.log(`Received payment.failed for order ${event.orderId}`);
    await this.transitionOrderStatus(
      event.orderId,
      "PAYMENT_FAILED",
      "SYSTEM",
      "Payment failed via webhook",
    );
  }

  async transitionOrderStatus(
    orderId: string,
    toStatus: OrderStatus,
    changedBy: string,
    reason?: string,
    actor?: { id: string; role: string },
  ) {
    if (actor && changedBy !== "SYSTEM") {
      await this.assertOrderAccess(orderId, actor.id, actor.role, "write");
    }

    return this.prisma.$transaction(async (tx) => {
      const orderData = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!orderData) throw new NotFoundException("Order not found");

      const orderAggregate = new OrderAggregate(orderData.id, orderData.status);
      const fromStatus = orderAggregate.getStatus();

      orderAggregate.transitionTo(toStatus);

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: orderAggregate.getStatus() },
      });

      if (orderAggregate.shouldCascadeStatus()) {
        await tx.sellerOrder.updateMany({
          where: { parentOrderId: orderId },
          data: { status: orderAggregate.getStatus() },
        });
      }

      await tx.orderAuditLog.create({
        data: {
          orderId,
          fromStatus,
          toStatus: orderAggregate.getStatus(),
          changedBy,
          reason,
        },
      });

      await this.outbox.createEvent(tx, "order.status_changed", {
        orderId,
        fromStatus,
        toStatus: orderAggregate.getStatus(),
        changedBy,
      });

      this.logger.log(
        `Order ${orderId} transitioned from ${fromStatus} to ${orderAggregate.getStatus()}`,
      );
      return updatedOrder;
    });
  }

  async assertOrderAccess(
    orderId: string,
    userId: string,
    role: string,
    mode: "read" | "write" = "read",
  ) {
    if (role === "ADMIN") return;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { sellerOrders: { select: { sellerId: true } } },
    });

    if (!order) throw new NotFoundException("Order not found");

    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerOrders.some((so) => so.sellerId === userId);

    if (mode === "read" && (isBuyer || isSeller)) return;

    if (mode === "write") {
      if (isSeller || isBuyer) return;
    }

    throw new ForbiddenException("You do not have permission to access this order");
  }

  async findAllOrders(page = 1, limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * safeLimit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: safeLimit,
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          sellerOrders: {
            include: {
              items: true,
              seller: { select: { id: true, name: true, storeName: true } },
            },
          },
          shippingAddress: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.order.count(),
    ]);

    return { items, total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async findBuyerOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: {
        sellerOrders: {
          include: { items: true, seller: { select: { storeName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async findSellerOrders(sellerId: string, requesterId: string, requesterRole: string) {
    if (requesterRole !== "ADMIN" && sellerId !== requesterId) {
      throw new ForbiddenException("You can only view your own seller orders");
    }

    return this.prisma.sellerOrder.findMany({
      where: { sellerId },
      include: {
        items: true,
        parentOrder: {
          select: {
            buyer: { select: { name: true, email: true } },
            shippingAddress: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
