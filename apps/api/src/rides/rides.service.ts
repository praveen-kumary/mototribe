import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRideDto } from "./rides.dto";

@Injectable()
export class RidesService {
  constructor(private prisma: PrismaService) {}

  async getUpcomingRides() {
    return this.prisma.ride.findMany({
      where: {
        date: { gte: new Date() },
      },
      include: { _count: { select: { rsvps: true } } },
      orderBy: { date: "asc" },
    });
  }

  async createRide(userId: string, dto: CreateRideDto) {
    return this.prisma.ride.create({
      data: {
        creatorId: userId,
        name: dto.name,
        description: dto.description,
        date: dto.date,
        location: dto.location,
      },
    });
  }

  async toggleRsvp(userId: string, rideId: string) {
    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException("Ride not found");

    const existing = await this.prisma.rideRSVP.findUnique({
      where: { userId_rideId: { userId, rideId } },
    });

    if (existing) {
      await this.prisma.rideRSVP.delete({
        where: { userId_rideId: { userId, rideId } },
      });
      return { rsvp: false };
    } else {
      await this.prisma.rideRSVP.create({
        data: { userId, rideId },
      });
      return { rsvp: true };
    }
  }
}
