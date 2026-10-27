import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.role.findMany({
      include: { permissions: true }
    });
  }
}
