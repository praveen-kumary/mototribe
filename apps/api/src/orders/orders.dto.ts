import { IsNotEmpty, IsArray, ValidateNested, IsInt, Min, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateOrderItemDto {
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNotEmpty()
  @IsString()
  shippingAddressId: string;
}

export class VerifyPaymentDto {
  @IsNotEmpty()
  razorpay_order_id: string;

  @IsNotEmpty()
  razorpay_payment_id: string;

  @IsNotEmpty()
  razorpay_signature: string;
}
