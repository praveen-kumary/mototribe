import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators';
import { ApplyCreatorDto, UpdateCreatorStatusDto } from './creators.dto';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Get()
  getAll() {
    return this.creatorsService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.creatorsService.getDashboard(req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  apply(@Req() req: any, @Body() dto: ApplyCreatorDto) {
    return this.creatorsService.apply(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCreatorStatusDto) {
    return this.creatorsService.updateStatus(id, dto.status);
  }
}
