import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OutboxService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper to write an event to the outbox table as part of a larger transaction.
   * We pass the Prisma transaction client (`tx`) so it runs atomically.
   */
  async createEvent(tx: any, type: string, payload: any) {
    return tx.outboxEvent.create({
      data: {
        type,
        payload,
        status: "PENDING",
      },
    });
  }

  /**
   * Fetch pending outbox events for processing using SKIP LOCKED to prevent concurrent pod processing.
   */
  async claimPendingEvents(limit = 50) {
    // We use a raw query because Prisma does not natively support SKIP LOCKED.
    // The subquery finds available events, locks them, and the outer query updates them to PROCESSING.
    const events = await this.prisma.$queryRaw<any[]>`
      UPDATE "OutboxEvent"
      SET 
        status = 'PROCESSING',
        "leaseUntil" = NOW() + INTERVAL '5 minutes',
        "processingNode" = ${process.env.HOSTNAME || 'unknown'}
      WHERE id IN (
        SELECT id FROM "OutboxEvent"
        WHERE status = 'PENDING' OR (status = 'FAILED' AND "nextRetryAt" <= NOW())
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `;
    return events;
  }

  /**
   * Mark an event as processed.
   */
  async markAsProcessed(id: string) {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { status: "PROCESSED", processedAt: new Date(), leaseUntil: null },
    });
  }

  /**
   * Mark an event as failed with an error message and increment retry.
   */
  async markAsFailed(id: string, error: string) {
    const event = await this.prisma.outboxEvent.findUnique({ where: { id } });
    if (!event) return;

    const newRetryCount = event.retryCount + 1;
    // Exponential backoff: 2^retryCount minutes
    const backoffMinutes = Math.pow(2, newRetryCount);
    const nextRetryAt = new Date(Date.now() + backoffMinutes * 60000);

    return this.prisma.outboxEvent.update({
      where: { id },
      data: { 
        status: "FAILED", 
        error,
        retryCount: newRetryCount,
        nextRetryAt,
        leaseUntil: null
      },
    });
  }
}
