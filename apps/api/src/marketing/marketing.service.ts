import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.marketingCampaign.findMany({ include: { seller: true }});
    }
    return this.prisma.marketingCampaign.findMany({
      where: { sellerId: userId }
    });
  }

  async create(data: any, userId: string, role: string) {
    return this.prisma.marketingCampaign.create({
      data: {
        ...data,
        sellerId: role === 'ADMIN' ? null : userId
      }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.marketingCampaign.update({
      where: { id },
      data: { status }
    });
  }
}
