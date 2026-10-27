import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ChatService } from "./chat.service";
import { CreateThreadDto, SendMessageDto } from "./chat.dto";
import { CurrentUser } from "../common/decorators";

@UseGuards(AuthGuard("jwt"))
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("threads")
  getMyThreads(@CurrentUser() user: { id: string }) {
    return this.chatService.getMyThreads(user.id);
  }

  @Post("threads")
  createThread(@CurrentUser() user: { id: string }, @Body() dto: CreateThreadDto) {
    return this.chatService.createThread(user.id, dto);
  }

  @Get("threads/:id/messages")
  getThreadMessages(@CurrentUser() user: { id: string }, @Param("id") threadId: string) {
    return this.chatService.getThreadMessages(user.id, threadId);
  }

  @Post("threads/:id/messages")
  sendMessage(
    @CurrentUser() user: { id: string },
    @Param("id") threadId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.id, threadId, dto);
  }
}
