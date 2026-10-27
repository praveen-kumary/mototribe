import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { OutboxService } from "./outbox.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly outboxService: OutboxService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Poll every 5 seconds. We use a lock to prevent concurrent processing overlaps.
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutboxEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const events = await this.outboxService.claimPendingEvents(100);
      if (events.length > 0) {
        this.logger.debug(`Found ${events.length} pending outbox events.`);
      }

      for (const event of events) {
        try {
          // Emit the event internally to the rest of the application
          await this.eventEmitter.emitAsync(event.type, event.payload);
          
          // Mark as processed only if successfully emitted
          await this.outboxService.markAsProcessed(event.id);
          this.logger.log(`Successfully processed event ${event.id} [${event.type}]`);
        } catch (error: any) {
          this.logger.error(`Failed to process event ${event.id} [${event.type}]`, error.stack);
          await this.outboxService.markAsFailed(event.id, error.message || "Unknown error");
        }
      }
    } catch (error) {
      this.logger.error("Error fetching outbox events", error);
    } finally {
      this.isProcessing = false;
    }
  }
}
