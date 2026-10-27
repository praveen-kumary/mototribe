import { Controller, Get, Patch, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getAll(@Req() req: any) {
    if (req.user.role !== 'ADMIN') throw new UnauthorizedException('Admin only');
    return this.settingsService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':key')
  updateSetting(@Req() req: any, @Param('key') key: string, @Body('value') value: any) {
    if (req.user.role !== 'ADMIN') throw new UnauthorizedException('Admin only');
    return this.settingsService.updateSetting(key, value);
  }
}
