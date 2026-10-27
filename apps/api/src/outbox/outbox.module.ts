import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { OutboxService } from "./outbox.service";
import { OutboxProcessor } from "./outbox.processor";

@Module({
  imports: [PrismaModule],
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}
