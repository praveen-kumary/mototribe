import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateDisputeStatusDto } from '../common/dto/platform.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  async getDisputes(@Req() req: any) {
    return this.disputesService.findAll(req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDisputeStatusDto) {
    return this.disputesService.updateStatus(id, dto.status);
  }
}
