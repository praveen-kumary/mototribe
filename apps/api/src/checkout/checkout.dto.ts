import { IsNotEmpty, IsArray, ValidateNested, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CheckoutItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  quantity: number;
}

export class CreateCheckoutSessionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsNotEmpty()
  @IsString()
  shippingAddressId: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
}
