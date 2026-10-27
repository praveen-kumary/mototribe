import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateThreadDto, SendMessageDto } from "./chat.dto";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMyThreads(userId: string) {
    return this.prisma.chatThread.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, storeName: true, avatar: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastUpdated: "desc" },
    });
  }

  async getThreadMessages(userId: string, threadId: string) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException();
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.chatMessage.findMany({
      where: { threadId },
      include: { sender: { select: { id: true, name: true, storeName: true, avatar: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async createThread(userId: string, dto: CreateThreadDto) {
    return this.prisma.chatThread.create({
      data: {
        buyerId: userId,
        sellerId: dto.sellerId,
        subject: dto.subject,
      },
    });
  }

  async sendMessage(userId: string, threadId: string, dto: SendMessageDto) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException();
    if (thread.buyerId !== userId && thread.sellerId !== userId) {
      throw new ForbiddenException();
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        threadId,
        senderId: userId,
        text: dto.text,
      },
      include: { sender: { select: { id: true, name: true, storeName: true, avatar: true } } },
    });

    await this.prisma.chatThread.update({
      where: { id: threadId },
      data: { lastUpdated: new Date() },
    });

    return message;
  }
}
