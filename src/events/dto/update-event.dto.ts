import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsString()
  @IsNotEmpty()
  id!: string;

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
