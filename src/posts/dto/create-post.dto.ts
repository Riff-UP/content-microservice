import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

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
  @IsUrl()
  @IsString()
  content?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}
