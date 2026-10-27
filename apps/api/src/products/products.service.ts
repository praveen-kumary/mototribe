import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "./products.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private async assertApprovedSeller(sellerId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { role: true, sellerStatus: true },
    });

    if (!seller || seller.role !== "SELLER") {
      throw new ForbiddenException("Only approved sellers can manage products");
    }

    if (seller.sellerStatus !== "APPROVED") {
      throw new ForbiddenException(
        "Seller account pending approval. You cannot list products yet.",
      );
    }
  }

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { status: "ACTIVE", deletedAt: null };

    if (query.q) {
      const tsQuery = query.q.trim().split(/\s+/).join(" | ");

      where.OR = [
        { name: { search: tsQuery } },
        { description: { search: tsQuery } },
        { tags: { has: query.q } },
      ];
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }

    if (query.bike) {
      where.fitments = {
        some: {
          bikeModel: {
            name: { contains: query.bike, mode: "insensitive" },
          },
        },
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (query.sort) {
      case "price-low":
        orderBy = { price: "asc" };
        break;
      case "price-high":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          seller: { select: { id: true, name: true, avatar: true } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        seller: { select: { id: true, name: true, avatar: true, storeName: true } },
        fitments: {
          include: {
            bikeModel: { include: { make: true } },
          },
        },
        reviews: {
          where: { status: "APPROVED" },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product || product.status === "ARCHIVED") {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async create(sellerId: string, dto: CreateProductDto, role?: string) {
    if (role !== "ADMIN") {
      await this.assertApprovedSeller(sellerId);
    }

    const slug = this.generateSlug(dto.name);

    return this.prisma.product.create({
      data: {
        sellerId,
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        comparePrice: dto.comparePrice,
        costPrice: dto.costPrice,
        sku: dto.sku,
        barcode: dto.barcode,
        weight: dto.weight,
        stock: dto.stock ?? 0,
        availableStock: dto.stock ?? 0,
        category: dto.category,
        tags: dto.tags ?? [],
        status: dto.status ?? "DRAFT",
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
      },
      include: { images: true },
    });
  }

  async update(productId: string, sellerId: string, dto: UpdateProductDto, role?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");
    if (product.sellerId !== sellerId && role !== "ADMIN") throw new ForbiddenException();

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...dto,
        slug: dto.name ? this.generateSlug(dto.name) : undefined,
        availableStock: dto.stock !== undefined ? dto.stock : undefined,
      },
      include: { images: true },
    });
  }

  async remove(productId: string, sellerId: string, role?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");
    if (product.sellerId !== sellerId && role !== "ADMIN") throw new ForbiddenException();

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED" },
    });
  }

  async findBySeller(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId, status: { not: "ARCHIVED" } },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  async updateStatus(productId: string, sellerId: string, status: string, role?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");
    if (product.sellerId !== sellerId && role !== "ADMIN") throw new ForbiddenException();

    if (role !== "ADMIN" && status === "ACTIVE") {
      await this.assertApprovedSeller(sellerId);
    }

    let dbStatus: any = "ACTIVE";
    if (status === "DRAFT" || status === "ARCHIVED" || status === "ACTIVE") {
      dbStatus = status;
    } else if (status === "OUT_OF_STOCK") {
      return this.prisma.product.update({
        where: { id: productId },
        data: { stock: 0, availableStock: 0 },
      });
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: dbStatus },
    });
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${base}-${suffix}`;
  }
}
