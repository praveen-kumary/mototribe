import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.dispute.findMany({ include: { order: true, buyer: true, seller: true }});
    }
    return this.prisma.dispute.findMany({
      where: { sellerId: userId },
      include: { order: true, buyer: true, seller: true }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: { status }
    });
  }
}
