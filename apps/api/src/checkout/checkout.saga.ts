import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../prisma/prisma.service";
import { RulesService } from "../rules/rules.service";
import { OutboxService } from "../outbox/outbox.service";

export interface CheckoutInitiatedPayload {
  sessionId: string;
  buyerId: string;
  totalAmount: number;
  reservations: string[];
  items: Array<{ productId: string; quantity: number }>;
  shippingAddressId?: string;
}

@Injectable()
export class CheckoutSaga {
  private readonly logger = new Logger(CheckoutSaga.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rules: RulesService,
    private readonly outbox: OutboxService,
  ) {}

  @OnEvent("checkout.initiated")
  async handleCheckoutInitiated(payload: CheckoutInitiatedPayload) {
    await this.processCheckout(payload);
  }

  async processCheckout(payload: CheckoutInitiatedPayload): Promise<string> {
    this.logger.log(`Processing saga for checkout session: ${payload.sessionId}`);

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.checkoutSession.findUnique({
        where: { id: payload.sessionId },
      });

      if (!session) {
        throw new Error(`Checkout session ${payload.sessionId} not found`);
      }

      if (session.status !== "PENDING") {
        if (session.orderId) return session.orderId;
        this.logger.warn(`Session ${payload.sessionId} is already processed`);
        throw new Error(`Checkout session ${payload.sessionId} is not pending`);
      }

      const productIds = payload.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { images: { take: 1 }, seller: { select: { sellerStatus: true } } },
      });

      for (const product of products) {
        if (product.seller.sellerStatus !== "APPROVED") {
          throw new Error(`Seller for product ${product.id} is not approved`);
        }
      }

      let grandTotal = 0;
      let shippingTotal = 0;
      let taxTotal = 0;

      const sellerGroups = new Map<string, any[]>();
      for (const item of payload.items) {
        const product = products.find((p) => p.id === item.productId)!;
        if (!sellerGroups.has(product.sellerId)) {
          sellerGroups.set(product.sellerId, []);
        }
        sellerGroups.get(product.sellerId)!.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          quantity: item.quantity,
          image: product.images[0]?.url,
        });
      }

      const parentOrder = await tx.order.create({
        data: {
          buyerId: payload.buyerId,
          totalAmount: 0,
          grandTotal: 0,
          status: "PAYMENT_PENDING",
          shippingAddressId: payload.shippingAddressId,
        },
      });

      for (const [sellerId, items] of sellerGroups.entries()) {
        const subtotal = items.reduce((acc: number, i: any) => acc + i.price * i.quantity, 0);
        const shippingFee = await this.rules.calculateShippingFee(subtotal);
        const taxAmount = await this.rules.calculateTaxAmount(subtotal);
        const category = items[0]?.category || "ALL";
        const commissionPercentage = await this.rules.getCommissionPercentage(sellerId, category);
        const platformFee = Math.floor(subtotal * (commissionPercentage / 100));

        grandTotal += subtotal + shippingFee + taxAmount;
        shippingTotal += shippingFee;
        taxTotal += taxAmount;

        const sellerOrder = await tx.sellerOrder.create({
          data: {
            parentOrderId: parentOrder.id,
            sellerId,
            subtotal,
            shippingFee,
            taxAmount,
            platformFee,
            sellerPayout: subtotal - platformFee + shippingFee,
            status: "PAYMENT_PENDING",
          },
        });

        await tx.orderItem.createMany({
          data: items.map((i: any) => ({
            sellerOrderId: sellerOrder.id,
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        });
      }

      await tx.order.update({
        where: { id: parentOrder.id },
        data: {
          totalAmount: grandTotal - shippingTotal - taxTotal,
          grandTotal,
          shippingTotal,
          taxTotal,
        },
      });

      await tx.checkoutSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED", orderId: parentOrder.id },
      });

      await tx.inventoryReservation.updateMany({
        where: { id: { in: payload.reservations } },
        data: { orderId: parentOrder.id },
      });

      await this.outbox.createEvent(tx, "order.created", {
        orderId: parentOrder.id,
        buyerId: payload.buyerId,
        totalAmount: grandTotal,
      });

      this.logger.log(`Saga completed for session ${payload.sessionId} → order ${parentOrder.id}`);
      return parentOrder.id;
    });
  }
}
