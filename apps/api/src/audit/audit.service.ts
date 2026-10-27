import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log an action that mutates state.
   */
  async logAction(params: {
    actorId: string;
    action: string;
    entity: string;
    entityId: string;
    changes: Record<string, any>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          changes: params.changes,
        },
      });
      this.logger.log(`Audit: ${params.action} on ${params.entity}:${params.entityId} by ${params.actorId}`);
    } catch (error) {
      // We don't want audit logging to break the main application flow, so we catch and log
      this.logger.error("Failed to write audit log", error);
    }
  }

  /**
   * Used for fetching audit history for a specific entity (e.g. for Disputes)
   */
  async getEntityHistory(entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: "desc" },
    });
  }
}
