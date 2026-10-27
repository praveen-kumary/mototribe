import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;
}

export class UpdateBlogStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}
