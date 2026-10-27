import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./reviews.dto";
import { CurrentUser } from "../common/decorators";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get("product/:productId")
  getProductReviews(@Param("productId") productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  createReview(@CurrentUser() user: { id: string }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("dashboard")
  getDashboardReviews(@Req() req: any) {
    return this.reviewsService.getDashboardReviews(req.user.userId, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.reviewsService.updateStatus(id, status);
  }
}
