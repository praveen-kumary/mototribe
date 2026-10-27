import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RidesService } from "./rides.service";
import { CreateRideDto } from "./rides.dto";
import { CurrentUser } from "../common/decorators";

@Controller("rides")
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Get()
  getUpcomingRides() {
    return this.ridesService.getUpcomingRides();
  }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  createRide(@CurrentUser() user: { id: string }, @Body() dto: CreateRideDto) {
    return this.ridesService.createRide(user.id, dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post(":id/rsvp")
  toggleRsvp(@Param("id") rideId: string, @CurrentUser() user: { id: string }) {
    return this.ridesService.toggleRsvp(user.id, rideId);
  }
}
