import { IsNotEmpty, IsString } from "class-validator";

export class CreateThreadDto {
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @IsNotEmpty()
  @IsString()
  subject: string;
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}
