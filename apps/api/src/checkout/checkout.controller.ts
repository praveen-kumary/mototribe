import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CheckoutService } from "./checkout.service";
import { CreateCheckoutSessionDto } from "./checkout.dto";
import { CurrentUser } from "../common/decorators";

@UseGuards(AuthGuard("jwt"))
@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(@CurrentUser() user: { id: string }, @Body() dto: CreateCheckoutSessionDto) {
    return this.checkoutService.checkout(user.id, dto);
  }
}
