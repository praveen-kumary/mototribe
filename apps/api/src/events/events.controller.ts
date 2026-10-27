import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getAll() {
    return this.eventsService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.eventsService.getDashboard(req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Req() req: any, @Body() data: any) {
    return this.eventsService.create(req.user.userId, req.user.role, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.eventsService.updateStatus(id, status);
  }
}
