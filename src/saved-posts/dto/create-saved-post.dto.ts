import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateSavedPostDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  post_id!: string;

  @IsString()
  @IsNotEmpty()
  sql_user_id!: string;
}
