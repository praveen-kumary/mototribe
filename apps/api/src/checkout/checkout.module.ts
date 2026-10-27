import { Module } from "@nestjs/common";
import { CheckoutService } from "./checkout.service";
import { CheckoutController } from "./checkout.controller";
import { CheckoutSaga } from "./checkout.saga";
import { InventoryModule } from "../inventory/inventory.module";
import { PaymentsModule } from "../payments/payments.module";
import { OutboxModule } from "../outbox/outbox.module";
import { RulesModule } from "../rules/rules.module";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [InventoryModule, PaymentsModule, OutboxModule, RulesModule, OrdersModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, CheckoutSaga],
  exports: [CheckoutService],
})
export class CheckoutModule {}
