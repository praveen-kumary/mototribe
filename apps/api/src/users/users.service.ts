import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./users.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        xp: true,
        level: true,
        storeName: true,
        storeSlug: true,
        createdAt: true,
        garageBikes: {
          include: {
            bikeModel: { include: { make: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    let storeSlug = undefined;
    if (dto.storeName) {
      storeSlug = dto.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        storeSlug,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        storeName: true,
        storeSlug: true,
      },
    });
  }
}
