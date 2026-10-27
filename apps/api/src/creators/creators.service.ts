import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyCreatorDto } from './creators.dto';

@Injectable()
export class CreatorsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.creatorProfile.findMany({
      where: { status: 'APPROVED' },
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  getDashboard(role: string) {
    if (role === 'ADMIN') {
      return this.prisma.creatorProfile.findMany({
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }
    // Only admins review creators in dashboard
    return [];
  }

  apply(userId: string, dto: ApplyCreatorDto) {
    return this.prisma.creatorProfile.create({
      data: {
        bio: dto.bio,
        platforms: dto.platforms,
        userId,
        status: 'PENDING',
      },
    });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.creatorProfile.update({
      where: { id },
      data: { status },
    });
  }
}
