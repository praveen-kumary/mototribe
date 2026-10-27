import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  communityId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class CommunityRuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommunityRuleDto)
  rules?: CommunityRuleDto[];
}
