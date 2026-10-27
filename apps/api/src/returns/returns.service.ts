import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.sellerOrder.findMany({
        where: { status: { in: ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKED', 'RETURN_COMPLETED', 'REFUND_PENDING', 'REFUNDED'] } },
        include: { items: true, seller: true }
      });
    }
    return this.prisma.sellerOrder.findMany({
      where: { 
        sellerId: userId,
        status: { in: ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_PICKED', 'RETURN_COMPLETED', 'REFUND_PENDING', 'REFUNDED'] }
      },
      include: { items: true }
    });
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.sellerOrder.update({
      where: { id },
      data: { status }
    });
  }
}
