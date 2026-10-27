import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators';
import { CreateBlogDto, UpdateBlogStatusDto } from './blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  getAll() {
    return this.blogService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.blogService.getDashboard(req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateBlogDto) {
    return this.blogService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBlogStatusDto) {
    return this.blogService.updateStatus(id, dto.status);
  }
}
