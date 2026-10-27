import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { PrismaService } from "../prisma/prisma.service";
import Redis from "ioredis";
import { REDIS_CLIENT } from "../common/redis.module";

@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  async status() {
    const checks = await this.runChecks();
    const healthy = checks.database.ok && checks.redis.ok;

    if (!healthy) {
      throw new ServiceUnavailableException({
        status: "degraded",
        service: "mototribe-api",
        checks,
      });
    }

    return {
      status: "ok",
      service: "mototribe-api",
      checks,
    };
  }

  @Get("live")
  live() {
    return { status: "ok" };
  }

  @Get("ready")
  async ready() {
    return this.status();
  }

  private async runChecks() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);
    return { database, redis };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Database unavailable",
      };
    }
  }

  private async checkRedis() {
    try {
      const pong = await this.redis.ping();
      return { ok: pong === "PONG" };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Redis unavailable",
      };
    }
  }
}
