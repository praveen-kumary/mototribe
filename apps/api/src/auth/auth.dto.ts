import { IsEmail, IsNotEmpty, IsOptional, IsIn, MinLength } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsOptional()
  @IsIn(["RIDER", "SELLER"])
  role?: "RIDER" | "SELLER";
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class RefreshDto {
  @IsNotEmpty()
  refreshToken: string;
}
