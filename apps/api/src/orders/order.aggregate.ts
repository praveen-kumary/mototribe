import { OrderStatus } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";

export class OrderAggregate {
  constructor(
    private readonly id: string,
    private status: OrderStatus,
  ) {}

  public getStatus(): OrderStatus {
    return this.status;
  }

  public transitionTo(newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      CREATED: ["PAYMENT_PENDING", "CANCELLED"],
      PAYMENT_PENDING: ["PAYMENT_FAILED", "PAYMENT_SUCCESS", "CONFIRMED", "CANCELLED"],
      PAYMENT_FAILED: ["CANCELLED", "PAYMENT_PENDING"], // Retry payment
      PAYMENT_SUCCESS: ["CONFIRMED"],
      CONFIRMED: ["PACKING", "CANCELLED"],
      PACKING: ["READY_TO_SHIP", "CANCELLED"],
      READY_TO_SHIP: ["PICKED_UP"],
      PICKED_UP: ["IN_TRANSIT"],
      IN_TRANSIT: ["OUT_FOR_DELIVERY"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: ["RETURN_REQUESTED"],
      RETURN_REQUESTED: ["RETURN_APPROVED", "RETURN_COMPLETED"],
      RETURN_APPROVED: ["RETURN_PICKED"],
      RETURN_PICKED: ["RETURN_COMPLETED"],
      RETURN_COMPLETED: ["REFUND_PENDING"],
      REFUND_PENDING: ["REFUNDED"],
      REFUNDED: [],
      CANCELLED: ["REFUND_PENDING"],
    };

    const allowed = validTransitions[this.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Invalid order transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;
  }

  /**
   * Determine if this order status change should cascade to child seller orders.
   */
  public shouldCascadeStatus(): boolean {
    return ["PAYMENT_FAILED", "PAYMENT_SUCCESS", "CONFIRMED", "CANCELLED"].includes(this.status);
  }
}
