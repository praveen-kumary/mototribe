import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string, role: string) {
    if (role === 'ADMIN') {
      const users = await this.prisma.user.count();
      const orders = await this.prisma.order.count();
      const products = await this.prisma.product.count();
      
      const revenueRaw = await this.prisma.order.aggregate({
        _sum: { totalAmount: true }
      });
      const revenue = (revenueRaw._sum.totalAmount || 0) / 100;

      return {
        users,
        orders,
        products,
        revenue,
        charts: {
          sales: [100, 200, 300, 400, 500, 600, 700], // Mock chart data
        }
      };
    }
    
    // SELLER
    const orders = await this.prisma.sellerOrder.count({ where: { sellerId: userId } });
    const products = await this.prisma.product.count({ where: { sellerId: userId } });
    const revenueRaw = await this.prisma.sellerOrder.aggregate({
      where: { sellerId: userId },
      _sum: { sellerPayout: true }
    });
    const revenue = (revenueRaw._sum.sellerPayout || 0) / 100;

    return {
      orders,
      products,
      revenue,
      charts: {
        sales: [50, 100, 150, 200, 250, 300, 350],
      }
    };
  }
}
