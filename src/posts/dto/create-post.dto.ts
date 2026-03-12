import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  sql_user_id!: string;

  @IsString()
  @IsIn(['image', 'audio'])
  type!: 'image' | 'audio';

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  provider_meta?: {
    provider_url?: string;
  };
}
