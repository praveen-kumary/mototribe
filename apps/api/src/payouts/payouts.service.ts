import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.payout.findMany({ include: { seller: true }});
    }
    return this.prisma.payout.findMany({
      where: { sellerId: userId }
    });
  }

  async requestPayout(userId: string, amount: number) {
    return this.prisma.payout.create({
      data: {
        sellerId: userId,
        amount,
        status: 'PENDING'
      }
    });
  }

  async updateStatus(id: string, status: string, reference?: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { 
        status, 
        reference,
        processedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    });
  }
}
