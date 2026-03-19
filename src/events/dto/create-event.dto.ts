import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  sql_user_id!: string;

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @IsDateString()
  @IsNotEmpty()
  event_date!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsString()
  @IsOptional()
  artistName?: string;

  @IsString()
  @IsOptional()
  artistSlug?: string;

  @IsString()
  @IsOptional()
  artistAvatar?: string;

  @IsString()
  @IsOptional()
  eventPathBase?: string;

  @IsString()
  @IsOptional()
  eventUrlBase?: string;
}
