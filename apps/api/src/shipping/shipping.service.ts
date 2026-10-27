import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.shippingProfile.findMany({ include: { seller: true }});
    }
    return this.prisma.shippingProfile.findMany({
      where: { sellerId: userId }
    });
  }

  async create(data: any, userId: string, role: string) {
    return this.prisma.shippingProfile.create({
      data: {
        ...data,
        sellerId: role === 'ADMIN' ? null : userId
      }
    });
  }

  async updateActiveStatus(id: string, active: boolean) {
    return this.prisma.shippingProfile.update({
      where: { id },
      data: { active }
    });
  }
}
