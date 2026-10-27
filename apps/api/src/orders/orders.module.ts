import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { OutboxModule } from "../outbox/outbox.module";

@Module({
  imports: [ConfigModule, OutboxModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
