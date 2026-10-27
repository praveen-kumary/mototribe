import { IsNotEmpty, IsInt, Min, IsString } from "class-validator";

export class ReserveStockItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
