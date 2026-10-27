import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const VALID_ROLES = ["RIDER", "SELLER", "ADMIN"] as const;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformStats() {
    const [users, products, orders, revenue, sellers, pendingSellers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: {
          status: { in: ["CONFIRMED", "PACKING", "READY_TO_SHIP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"] },
        },
      }),
      this.prisma.user.count({ where: { role: "SELLER", sellerStatus: "APPROVED" } }),
      this.prisma.user.count({ where: { role: "SELLER", sellerStatus: "PENDING" } }),
    ]);

    return {
      users,
      products,
      orders,
      revenue: revenue._sum?.grandTotal ?? 0,
      activeSellers: sellers,
      pendingSellers,
    };
  }

  async getPendingSellers() {
    return this.prisma.user.findMany({
      where: { role: "SELLER", sellerStatus: "PENDING" },
      select: { id: true, name: true, email: true, storeName: true, createdAt: true },
    });
  }

  async approveSeller(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== "SELLER") throw new NotFoundException("Seller not found");
    if (user.sellerStatus === "APPROVED") throw new BadRequestException("Seller is already approved");

    return this.prisma.user.update({
      where: { id },
      data: { sellerStatus: "APPROVED" },
      select: { id: true, name: true, email: true, sellerStatus: true },
    });
  }

  async rejectSeller(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== "SELLER") throw new NotFoundException("Seller not found");

    return this.prisma.user.update({
      where: { id },
      data: { sellerStatus: "REJECTED" },
      select: { id: true, name: true, email: true, sellerStatus: true },
    });
  }

  async getAllSellers() {
    return this.prisma.user.findMany({
      where: { role: "SELLER" },
      select: {
        id: true,
        name: true,
        email: true,
        sellerStatus: true,
        storeName: true,
        role: true,
        createdAt: true,
        _count: { select: { products: true, sellerOrders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllUsers(page: number = 1, limit: number = 50, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role && VALID_ROLES.includes(role as any)) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          sellerStatus: true,
          storeName: true,
          avatar: true,
          createdAt: true,
          _count: { select: { orders: true, products: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async softDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    if (user.role === "ADMIN") throw new ForbiddenException("Cannot delete an admin user");

    // Soft delete: anonymize PII and deactivate
    return this.prisma.user.update({
      where: { id },
      data: {
        email: `deleted_${id}@removed.local`,
        name: "Deleted User",
        passwordHash: "",
        refreshToken: null,
      },
      select: { id: true },
    });
  }

  async updateUserRole(id: string, role: string) {
    if (!VALID_ROLES.includes(role as any)) {
      throw new BadRequestException(`Invalid role: ${role}. Must be one of: ${VALID_ROLES.join(", ")}`);
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    return this.prisma.user.update({
      where: { id },
      data: {
        role: role as any,
        sellerStatus: role === "SELLER" ? "PENDING" : null,
      },
      select: { id: true, name: true, email: true, role: true, sellerStatus: true },
    });
  }
}
