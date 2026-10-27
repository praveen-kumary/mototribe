import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController, SellersAdminController } from "./admin.controller";

@Module({
  controllers: [AdminController, SellersAdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
