import { Controller, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getAll(@Req() req: any) {
    if (req.user.role !== 'ADMIN') throw new UnauthorizedException('Admin only');
    return this.rolesService.getAll();
  }
}
