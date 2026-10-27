import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./reviews.dto";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  getProductReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: dto.productId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException("You have already reviewed this product");
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        body: dto.body,
        status: "PENDING",
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async getDashboardReviews(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.review.findMany({
        include: { user: { select: { name: true } }, product: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }
    return this.prisma.review.findMany({
      where: { product: { sellerId: userId } },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.review.update({
      where: { id },
      data: { status }
    });
  }
}
