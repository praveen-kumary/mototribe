import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminService } from "./admin.service";
import { RolesGuard } from "../common/roles.guard";
import { Roles } from "../common/decorators";

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles("ADMIN")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get("sellers/pending")
  getPendingSellers() {
    return this.adminService.getPendingSellers();
  }

  @Patch("sellers/:id/approve")
  approveSeller(@Param("id") id: string) {
    return this.adminService.approveSeller(id);
  }

  @Patch("sellers/:id/reject")
  rejectSeller(@Param("id") id: string) {
    return this.adminService.rejectSeller(id);
  }

  @Get("users")
  getAllUsers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("role") role?: string,
  ) {
    return this.adminService.getAllUsers(
      parseInt(page || "1", 10),
      parseInt(limit || "50", 10),
      role,
    );
  }

  @Delete("users/:id")
  deleteUser(@Param("id") id: string) {
    return this.adminService.softDeleteUser(id);
  }

  @Patch("users/:id/role")
  updateUserRole(@Param("id") id: string, @Body("role") role: string) {
    return this.adminService.updateUserRole(id, role);
  }
}

@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles("ADMIN")
@Controller("sellers")
export class SellersAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getAllSellers() {
    return this.adminService.getAllSellers();
  }

  @Patch(":id/approve")
  approveSeller(@Param("id") id: string) {
    return this.adminService.approveSeller(id);
  }

  @Patch(":id/reject")
  rejectSeller(@Param("id") id: string) {
    return this.adminService.rejectSeller(id);
  }
}
