import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.coupon.findMany();
    }
    return this.prisma.coupon.findMany({
      where: { sellerId: userId }
    });
  }

  async create(data: any, userId: string, role: string) {
    return this.prisma.coupon.create({
      data: {
        ...data,
        sellerId: role === 'ADMIN' ? null : userId
      }
    });
  }

  async toggleStatus(id: string, active: boolean) {
    return this.prisma.coupon.update({
      where: { id },
      data: { active }
    });
  }
}
