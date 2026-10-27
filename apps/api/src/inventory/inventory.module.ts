import { Module, OnModuleInit } from "@nestjs/common";
import { BullModule, InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { InventoryService } from "./inventory.service";
import { InventoryProcessor } from "./inventory.processor";
import { InventoryController } from './inventory.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: "inventory-queue",
    }),
  ],
  providers: [InventoryService, InventoryProcessor],
  exports: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule implements OnModuleInit {
  constructor(@InjectQueue("inventory-queue") private inventoryQueue: Queue) {}

  async onModuleInit() {
    // Run the release-expired job every minute
    await this.inventoryQueue.add(
      "release-expired",
      {},
      {
        repeat: {
          pattern: "* * * * *", // every minute
        },
      },
    );
  }
}
