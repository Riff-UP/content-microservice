import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
}

export class EventPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  userId?: string;
}