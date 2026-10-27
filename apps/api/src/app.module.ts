import { Controller, Get, Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { CommunityModule } from "./community/community.module";
import { GarageModule } from "./garage/garage.module";
import { ChatModule } from "./chat/chat.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { RidesModule } from "./rides/rides.module";
import { AdminModule } from "./admin/admin.module";

// We will build these next based on the new architecture plan:
import { OrdersModule } from "./orders/orders.module";
import { InventoryModule } from "./inventory/inventory.module";
import { PaymentsModule } from "./payments/payments.module";
import { CheckoutModule } from "./checkout/checkout.module";

// Phase 4 - Enterprise
import { OutboxModule } from "./outbox/outbox.module";
import { RulesModule } from "./rules/rules.module";
import { AuditModule } from "./audit/audit.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { CorrelationMiddleware } from "./common/correlation.middleware";
import { AppLogger } from "./common/logger";
import { RedisModule } from "./common/redis.module";
import { DisputesModule } from './disputes/disputes.module';
import { CouponsModule } from './coupons/coupons.module';
import { ReturnsModule } from './returns/returns.module';
import { PayoutsModule } from './payouts/payouts.module';
import { MarketingModule } from './marketing/marketing.module';
import { ShippingModule } from './shipping/shipping.module';
import { EventsModule } from './events/events.module';
import { BlogModule } from './blog/blog.module';
import { CreatorsModule } from './creators/creators.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { LogsModule } from './logs/logs.module';
import { RolesModule } from './roles/roles.module';
import { SettingsModule } from './settings/settings.module';

@Controller("health")
class HealthController {
  @Get()
  status() {
    return { status: "ok", service: "mototribe-api" };
  }
}

@Module({
  imports: [
    // 1. Core Config
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 2. Synchronous Event Bus
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
    }),
    
    // 3. Asynchronous Job Queues (BullMQ + Redis)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST", "localhost"),
          port: config.get<number>("REDIS_PORT", 6379),
        },
      }),
    }),
    
    // Cron Jobs
    ScheduleModule.forRoot(),

    // Global Rate Limiting
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60000, limit: 100 },
      { name: "auth", ttl: 60000, limit: 5 },
    ]),

    // 4. Database
    PrismaModule,

    // 4.5 Shared Redis
    RedisModule,

    // 5. Domains
    AuthModule,
    UsersModule,
    ProductsModule,
    CommunityModule,
    GarageModule,
    ChatModule,
    ReviewsModule,
    RidesModule,
    AdminModule,
    
    // Enterprise Checkout Flow
    InventoryModule,
    PaymentsModule,
    OrdersModule,
    CheckoutModule,
    OutboxModule,
    RulesModule,
    AuditModule,
    NotificationsModule,
    DisputesModule,
    CouponsModule,
    ReturnsModule,
    PayoutsModule,
    MarketingModule,
    ShippingModule,
    EventsModule,
    BlogModule,
    CreatorsModule,
    AnalyticsModule,
    LogsModule,
    RolesModule,
    SettingsModule,
  ],
  controllers: [HealthController],
  providers: [
    AppLogger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}

