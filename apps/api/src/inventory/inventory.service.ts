import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ReserveStockItemDto } from "./inventory.dto";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  async getInventoryList(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        reservedStock: true,
        status: true,
        price: true,
      },
      take: 500,
    });
  }

  async updateStock(productId: string, stock: number, sellerId: string, role: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true },
    });

    if (!product) throw new NotFoundException("Product not found");
    if (role !== "ADMIN" && product.sellerId !== sellerId) {
      throw new ForbiddenException("You can only update inventory for your own products");
    }

    if (stock < 0) throw new BadRequestException("Stock cannot be negative");

    return this.prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
  }

  async reserveStock(items: ReserveStockItemDto[], expirationMinutes = 15) {
    return this.prisma.$transaction(async (tx) => {
      const reservationIds: string[] = [];
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      for (const item of items) {
        const product = await tx.$queryRaw<any[]>`
          SELECT id, stock, "reservedStock" 
          FROM "Product" 
          WHERE id = ${item.productId} 
          FOR UPDATE
        `;

        if (!product || product.length === 0) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        const p = product[0];
        const availableStock = p.stock - p.reservedStock;

        if (availableStock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${item.productId}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { reservedStock: { increment: item.quantity } },
        });

        const reservation = await tx.inventoryReservation.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            expiresAt,
            status: "PENDING",
          },
        });

        reservationIds.push(reservation.id);
      }

      this.logger.log(
        `Reserved stock for ${items.length} items. Reservation IDs: ${reservationIds.join(", ")}`,
      );
      return { reservationIds, expiresAt };
    });
  }

  async commitReservations(reservationIds: string[], orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { id: { in: reservationIds }, status: "PENDING" },
      });

      for (const res of reservations) {
        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: "COMMITTED", orderId },
        });

        await tx.product.update({
          where: { id: res.productId },
          data: {
            stock: { decrement: res.quantity },
            reservedStock: { decrement: res.quantity },
          },
        });
      }
      this.logger.log(`Committed ${reservations.length} reservations for order ${orderId}`);
    });
  }

  async releaseExpiredReservations() {
    return this.prisma.$transaction(async (tx) => {
      const expired = await tx.inventoryReservation.findMany({
        where: {
          status: "PENDING",
          expiresAt: { lte: new Date() },
        },
        take: 500,
      });

      if (expired.length === 0) return 0;

      for (const res of expired) {
        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: "EXPIRED" },
        });

        await tx.product.update({
          where: { id: res.productId },
          data: { reservedStock: { decrement: res.quantity } },
        });
      }

      this.logger.log(`Released ${expired.length} expired reservations`);
      return expired.length;
    });
  }

  async commitReservationsByOrder(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId, status: "PENDING" },
      });

      for (const res of reservations) {
        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: "COMMITTED" },
        });

        await tx.product.update({
          where: { id: res.productId },
          data: {
            stock: { decrement: res.quantity },
            reservedStock: { decrement: res.quantity },
          },
        });
      }
      this.logger.log(`Committed ${reservations.length} reservations for order ${orderId}`);
    });
  }

  async releaseReservationsByOrder(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { orderId, status: "PENDING" },
      });

      for (const res of reservations) {
        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: "EXPIRED" },
        });

        await tx.product.update({
          where: { id: res.productId },
          data: { reservedStock: { decrement: res.quantity } },
        });
      }
      this.logger.log(`Released ${reservations.length} reservations for order ${orderId}`);
    });
  }
}
