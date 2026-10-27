import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.event.findMany({
      where: { status: { in: ['UPCOMING', 'ONGOING'] } },
      include: { seller: { select: { name: true, storeName: true } } },
      orderBy: { date: 'asc' }
    });
  }

  getDashboard(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.event.findMany({
        include: { seller: { select: { name: true, storeName: true } } },
        orderBy: { date: 'asc' }
      });
    }
    return this.prisma.event.findMany({
      where: { sellerId: userId },
      include: { seller: { select: { name: true, storeName: true } } },
      orderBy: { date: 'asc' }
    });
  }

  create(userId: string, role: string, data: any) {
    return this.prisma.event.create({
      data: {
        ...data,
        sellerId: role === 'ADMIN' ? null : userId,
        status: role === 'ADMIN' ? 'UPCOMING' : 'PENDING'
      }
    });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.event.update({
      where: { id },
      data: { status }
    });
  }
}
