import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ProductsService } from "./products.service";
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from "./products.dto";
import { CurrentUser, Roles } from "../common/decorators";
import { RolesGuard } from "../common/roles.guard";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER", "ADMIN")
  @Get("my-products")
  findMyProducts(@CurrentUser() user: { id: string }) {
    return this.productsService.findBySeller(user.id);
  }

  @Get("seller/:id")
  findBySeller(@Param("id") id: string) {
    return this.productsService.findBySeller(id);
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER", "ADMIN")
  @Post()
  create(
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(user.id, dto, user.role);
  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER", "ADMIN")
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body("status") status: string,
  ) {
    return this.productsService.updateStatus(id, user.id, status, user.role);
  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER", "ADMIN")
  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, user.id, dto, user.role);
  }

  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("SELLER", "ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.productsService.remove(id, user.id, user.role);
  }
}
