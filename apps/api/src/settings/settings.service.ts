import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.platformSetting.findMany();
  }

  async updateSetting(key: string, value: any) {
    return this.prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
}
