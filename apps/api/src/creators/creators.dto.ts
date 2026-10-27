import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { IsJSON } from 'class-validator';

export class ApplyCreatorDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  platforms?: Record<string, string>;
}

export class UpdateCreatorStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}
