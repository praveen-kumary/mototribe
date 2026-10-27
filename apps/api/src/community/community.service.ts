import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePostDto, CreateCommentDto, CreateCommunityDto } from "./community.dto";

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async getCommunities() {
    return this.prisma.community.findMany({
      include: {
        _count: { select: { members: true, posts: true } },
        rules: true,
      }
    });
  }

  async createCommunity(userId: string, dto: CreateCommunityDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    return this.prisma.community.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        creatorId: userId,
        members: {
          create: [{ userId: userId, role: "ADMIN" }]
        },
        rules: {
          create: dto.rules?.map(r => ({ title: r.title, description: r.description })) || []
        }
      },
      include: {
        _count: { select: { members: true, posts: true } },
        rules: true,
      }
    });
  }

  async getPosts(communityId?: string, sort?: string, filter?: string, userId?: string) {
    let where: any = {};
    if (communityId) {
      where.communityId = communityId;
    }

    if (filter === "following" && userId) {
      // Find communities the user is a member of
      const memberships = await this.prisma.communityMember.findMany({
        where: { userId },
        select: { communityId: true },
      });
      where.communityId = { in: memberships.map((m) => m.communityId) };
    } else if (filter === "my-posts" && userId) {
      where.authorId = userId;
      where.isDraft = false;
    } else if (filter === "saved" && userId) {
      const saved = await this.prisma.postBookmark.findMany({
        where: { userId },
        select: { postId: true },
      });
      where.id = { in: saved.map((s) => s.postId) };
    } else if (filter === "drafts" && userId) {
      where.authorId = userId;
      where.isDraft = true;
    } else {
      where.isDraft = false;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = { score: "desc" };
    }

    return this.prisma.post.findMany({
      where,
      include: {
        author: { select: { name: true, avatar: true } },
        community: true,
        _count: { select: { comments: true, upvotes: true } },
      },
      orderBy,
    });
  }

  async getPostById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, avatar: true } },
        community: true,
        comments: {
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { comments: true, upvotes: true } },
      },
    });
    if (!post) throw new NotFoundException();
    return post;
  }

  async createPost(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId: userId,
        communityId: dto.communityId,
        title: dto.title,
        body: dto.body,
      },
      include: { author: { select: { name: true, avatar: true } } },
    });
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException("Post not found");

    return this.prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        body: dto.body,
      },
      include: { author: { select: { name: true, avatar: true } } },
    });
  }

  async toggleUpvote(userId: string, postId: string) {
    const existing = await this.prisma.postUpvote.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await this.prisma.postUpvote.delete({ where: { userId_postId: { userId, postId } } });
      await this.prisma.post.update({ where: { id: postId }, data: { score: { decrement: 1 } } });
      return { upvoted: false };
    } else {
      await this.prisma.postUpvote.create({ data: { userId, postId } });
      await this.prisma.post.update({ where: { id: postId }, data: { score: { increment: 1 } } });
      return { upvoted: true };
    }
  }

  async toggleSavePost(userId: string, postId: string) {
    const existing = await this.prisma.postBookmark.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await this.prisma.postBookmark.delete({ where: { userId_postId: { userId, postId } } });
      return { saved: false };
    } else {
      await this.prisma.postBookmark.create({ data: { userId, postId } });
      return { saved: true };
    }
  }
}
