import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.blogArticle.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: { select: { name: true, storeName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  getDashboard(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.blogArticle.findMany({
        include: { author: { select: { name: true, storeName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }
    return this.prisma.blogArticle.findMany({
      where: { authorId: userId },
      include: { author: { select: { name: true, storeName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  create(userId: string, dto: CreateBlogDto) {
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5);
    return this.prisma.blogArticle.create({
      data: {
        title: dto.title,
        content: dto.content ?? '',
        coverImage: dto.coverImage,
        slug,
        authorId: userId,
        status: 'DRAFT',
      },
    });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.blogArticle.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }
}
