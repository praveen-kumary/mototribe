import { IsNotEmpty, IsInt, Min, IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class AddBikeDto {
  @IsNotEmpty()
  @IsString()
  bikeModelId: string;

  @IsInt()
  @Min(1900)
  year: number;

  @IsOptional()
  @IsString()
  nickname?: string;
}

export class AddServiceLogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  odometerKm: number;

  @IsNotEmpty()
  @Type(() => Date)
  date: Date;
}
