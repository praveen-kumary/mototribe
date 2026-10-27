import { Controller, Get, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../common/roles.guard";
import { CurrentUser, Roles } from "../common/decorators";

@Controller("inventory")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles("SELLER", "ADMIN")
  async getInventory(@CurrentUser() user: { id: string }) {
    return this.inventoryService.getInventoryList(user.id);
  }

  @Patch(":id/stock")
  @Roles("SELLER", "ADMIN")
  async updateStock(
    @Param("id") id: string,
    @Body("stock") stock: number,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.inventoryService.updateStock(id, stock, user.id, user.role);
  }
}
