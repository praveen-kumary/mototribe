import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InventoryService } from "../inventory/inventory.service";
import { PaymentsService } from "../payments/payments.service";
import { OutboxService } from "../outbox/outbox.service";
import { RulesService } from "../rules/rules.service";
import { CheckoutSaga } from "./checkout.saga";
import { CreateCheckoutSessionDto } from "./checkout.dto";
import Redis from "ioredis";
import { REDIS_CLIENT } from "../common/redis.module";

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private prisma: PrismaService,
    private inventory: InventoryService,
    private payments: PaymentsService,
    private outbox: OutboxService,
    private rules: RulesService,
    private checkoutSaga: CheckoutSaga,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async checkout(buyerId: string, dto: CreateCheckoutSessionDto) {
    const idempotencyKey = `checkout:idemp:${buyerId}:${dto.idempotencyKey}`;
    const existing = await this.redis.get(idempotencyKey);
    if (existing) {
      this.logger.log(`Returning idempotent response for key: ${dto.idempotencyKey}`);
      return JSON.parse(existing);
    }

    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId: buyerId, deletedAt: null },
    });
    if (!address) {
      throw new BadRequestException("Invalid shipping address");
    }

    const productIds = dto.items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE", deletedAt: null },
      include: { seller: { select: { sellerStatus: true } } },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException("Some products in cart are invalid or unavailable");
    }

    for (const product of products) {
      if (product.seller.sellerStatus !== "APPROVED") {
        throw new ForbiddenException(
          `Product "${product.name}" is from a seller that is not yet approved`,
        );
      }
    }

    let grandTotal = 0;
    const sellerGroups = new Map<string, any[]>();
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (!sellerGroups.has(product.sellerId)) {
        sellerGroups.set(product.sellerId, []);
      }
      sellerGroups.get(product.sellerId)!.push({
        price: product.price,
        quantity: item.quantity,
      });
    }

    for (const [, items] of sellerGroups.entries()) {
      const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
      const shippingFee = await this.rules.calculateShippingFee(subtotal);
      const taxAmount = await this.rules.calculateTaxAmount(subtotal);
      grandTotal += subtotal + shippingFee + taxAmount;
    }

    const { reservationIds, expiresAt } = await this.inventory.reserveStock(dto.items);

    try {
      const session = await this.prisma.$transaction(async (tx) => {
        const newSession = await tx.checkoutSession.create({
          data: {
            buyerId,
            status: "PENDING",
            idempotencyKey: dto.idempotencyKey,
            totalAmount: grandTotal,
            expiresAt,
          },
        });

        await tx.inventoryReservation.updateMany({
          where: { id: { in: reservationIds } },
          data: { orderId: newSession.id },
        });

        await this.outbox.createEvent(tx, "checkout.initiated", {
          sessionId: newSession.id,
          buyerId,
          totalAmount: grandTotal,
          reservations: reservationIds,
          items: dto.items,
          shippingAddressId: dto.shippingAddressId,
        });

        return newSession;
      });

      const orderId = await this.checkoutSaga.processCheckout({
        sessionId: session.id,
        buyerId,
        totalAmount: grandTotal,
        reservations: reservationIds,
        items: dto.items,
        shippingAddressId: dto.shippingAddressId,
      });

      const paymentIntent = await this.payments.createIntent({
        amount: grandTotal,
        currency: "INR",
        orderId,
      });

      const result = {
        sessionId: session.id,
        orderId,
        paymentIntentId: paymentIntent.providerOrderId,
        amount: grandTotal,
        expiresAt,
      };

      await this.redis.set(idempotencyKey, JSON.stringify(result), "EX", 86400);

      return result;
    } catch (error: any) {
      this.logger.error("Checkout failed, releasing reservations", error);
      throw error;
    }
  }
}
