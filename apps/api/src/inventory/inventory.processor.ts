import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { InventoryService } from "./inventory.service";
import { Logger } from "@nestjs/common";

@Processor("inventory-queue")
export class InventoryProcessor extends WorkerHost {
  private readonly logger = new Logger(InventoryProcessor.name);

  constructor(private readonly inventoryService: InventoryService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === "release-expired") {
      this.logger.debug("Running job: release-expired");
      const releasedCount = await this.inventoryService.releaseExpiredReservations();
      return { releasedCount };
    }
  }
}
