import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateReturnStatusDto } from '../common/dto/platform.dto';

@Controller('returns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  async getReturns(@Req() req: any) {
    return this.returnsService.findAll(req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateReturnStatusDto) {
    return this.returnsService.updateStatus(id, dto.status);
  }
}
