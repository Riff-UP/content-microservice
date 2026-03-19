import { IsString, IsOptional, IsEmail } from 'class-validator';

export class AuthTokenGeneratedDto {
  @IsString()
  userId!: string;

  @IsString()
  token!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  googleId?: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
