import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get()
  async getCampaigns(@Req() req: any) {
    return this.marketingService.findAll(req.user.userId, req.user.role);
  }

  @Post()
  async createCampaign(@Req() req: any, @Body() body: any) {
    return this.marketingService.create(body, req.user.userId, req.user.role);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.marketingService.updateStatus(id, status);
  }
}
