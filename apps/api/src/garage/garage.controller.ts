import { Controller, Get, Post, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GarageService } from "./garage.service";
import { AddBikeDto, AddServiceLogDto } from "./garage.dto";
import { CurrentUser } from "../common/decorators";

@UseGuards(AuthGuard("jwt"))
@Controller("garage")
export class GarageController {
  constructor(private readonly garageService: GarageService) {}

  @Get()
  getMyGarage(@CurrentUser() user: { id: string }) {
    return this.garageService.getMyGarage(user.id);
  }

  @Post("bikes")
  addBike(@CurrentUser() user: { id: string }, @Body() dto: AddBikeDto) {
    return this.garageService.addBike(user.id, dto);
  }

  @Delete("bikes/:id")
  removeBike(@CurrentUser() user: { id: string }, @Param("id") bikeId: string) {
    return this.garageService.removeBike(user.id, bikeId);
  }

  @Get("bikes/:id/service-logs")
  getServiceLogs(@CurrentUser() user: { id: string }, @Param("id") bikeId: string) {
    return this.garageService.getServiceLogs(user.id, bikeId);
  }

  @Post("bikes/:id/service-logs")
  addServiceLog(
    @CurrentUser() user: { id: string },
    @Param("id") bikeId: string,
    @Body() dto: AddServiceLogDto,
  ) {
    return this.garageService.addServiceLog(user.id, bikeId, dto);
  }

  @Get("dashboard")
  getDashboard() {
    return this.garageService.getDashboard();
  }
}
