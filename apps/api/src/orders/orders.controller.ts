import { Controller, Get, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OrdersService } from "./orders.service";
import { CurrentUser, Roles } from "../common/decorators";
import { RolesGuard } from "../common/roles.guard";
import { OrderStatus } from "@prisma/client";

type AuthUser = { id: string; role: string };

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles("ADMIN")
  @Get()
  findAllOrders(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.ordersService.findAllOrders(
      parseInt(page || "1", 10),
      parseInt(limit || "50", 10),
    );
  }

  @Get("my-orders")
  findBuyerOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.findBuyerOrders(user.id);
  }

  @Roles("SELLER", "ADMIN")
  @Get("seller-orders")
  findSellerOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.findSellerOrders(user.id, user.id, user.role);
  }

  @Roles("SELLER", "ADMIN")
  @Get("seller/:id")
  findSellerOrdersById(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.findSellerOrders(id, user.id, user.role);
  }

  @Roles("SELLER", "ADMIN", "RIDER")
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body("status") status: OrderStatus,
  ) {
    return this.ordersService.transitionOrderStatus(id, status, user.id, undefined, user);
  }
}
