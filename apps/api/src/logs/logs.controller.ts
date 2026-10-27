import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getAll(@Req() req: any) {
    if (req.user.role !== 'ADMIN') throw new UnauthorizedException('Admin only');
    return this.logsService.getAll();
  }
}
