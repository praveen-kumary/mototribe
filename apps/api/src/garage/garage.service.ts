import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddBikeDto, AddServiceLogDto } from "./garage.dto";

@Injectable()
export class GarageService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateGarage(userId: string) {
    let garage = await this.prisma.garage.findUnique({ where: { userId } });
    if (!garage) {
      garage = await this.prisma.garage.create({ data: { userId } });
    }
    return garage;
  }

  async getMyGarage(userId: string) {
    return this.prisma.garageBike.findMany({
      where: { userId },
      include: {
        bikeModel: { include: { make: true } },
        serviceLogs: { orderBy: { date: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async addBike(userId: string, dto: AddBikeDto) {
    const garage = await this.getOrCreateGarage(userId);
    return this.prisma.garageBike.create({
      data: {
        userId,
        garageId: garage.id,
        bikeModelId: dto.bikeModelId,
        year: dto.year,
        nickname: dto.nickname,
      },
      include: {
        bikeModel: { include: { make: true } },
      },
    });
  }

  getDashboard() {
    return this.prisma.garageBike.findMany({
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit for dashboard
    });
  }

  async removeBike(userId: string, bikeId: string) {
    const bike = await this.prisma.garageBike.findUnique({ where: { id: bikeId } });
    if (!bike || bike.userId !== userId) throw new NotFoundException();

    return this.prisma.garageBike.delete({ where: { id: bikeId } });
  }

  async addServiceLog(userId: string, bikeId: string, dto: AddServiceLogDto) {
    const bike = await this.prisma.garageBike.findUnique({ where: { id: bikeId } });
    if (!bike || bike.userId !== userId) throw new NotFoundException();

    return this.prisma.serviceLog.create({
      data: {
        garageBikeId: bikeId,
        title: dto.title,
        description: dto.description,
        odometerKm: dto.odometerKm,
        date: dto.date,
      },
    });
  }

  async getServiceLogs(userId: string, bikeId: string) {
    const bike = await this.prisma.garageBike.findUnique({ where: { id: bikeId } });
    if (!bike || bike.userId !== userId) throw new NotFoundException();

    return this.prisma.serviceLog.findMany({
      where: { garageBikeId: bikeId },
      orderBy: { date: "desc" },
    });
  }
}
