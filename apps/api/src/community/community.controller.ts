import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CommunityService } from "./community.service";
import { CreatePostDto, CreateCommentDto, CreateCommunityDto } from "./community.dto";
import { CurrentUser } from "../common/decorators";

@Controller("community")
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get("groups")
  getCommunities() {
    return this.communityService.getCommunities();
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("groups")
  createCommunity(@CurrentUser() user: { id: string }, @Body() dto: CreateCommunityDto) {
    return this.communityService.createCommunity(user.id, dto);
  }

  @Get("posts")
  getPosts(
    @Query("communityId") communityId?: string,
    @Query("sort") sort?: string,
    @Query("filter") filter?: string,
    @Query("userId") userId?: string // passed by frontend optionally, though better from jwt, but for public GETs we'll let frontend pass it or we'll get it if provided. 
    // Ideally we should use @CurrentUser if @UseGuards(AuthGuard) is applied, but GET /posts is public. 
    // The UI should pass `userId` as a query param if it wants personalized filters, or we make it an optional AuthGuard.
  ) {
    return this.communityService.getPosts(communityId, sort, filter, userId);
  }

  @Get("posts/:id")
  getPostById(@Param("id") id: string) {
    return this.communityService.getPostById(id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("posts")
  createPost(@CurrentUser() user: { id: string }, @Body() dto: CreatePostDto) {
    return this.communityService.createPost(user.id, dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("posts/:id/comments")
  addComment(
    @Param("id") postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.addComment(user.id, postId, dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("posts/:id/upvote")
  toggleUpvote(@Param("id") postId: string, @CurrentUser() user: { id: string }) {
    return this.communityService.toggleUpvote(user.id, postId);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("posts/:id/save")
  toggleSavePost(@Param("id") postId: string, @CurrentUser() user: { id: string }) {
    return this.communityService.toggleSavePost(user.id, postId);
  }
}
