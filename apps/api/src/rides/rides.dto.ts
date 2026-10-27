import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateRideDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @IsNotEmpty()
  @IsString()
  location: string;
}
