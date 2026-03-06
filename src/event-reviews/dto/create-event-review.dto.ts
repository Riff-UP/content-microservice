import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEventReviewDto {
  @IsString()
  @IsNotEmpty()
  event_id!: string;

  @IsString()
  @IsNotEmpty()
  sql_user_id!: string;

  @IsNumber()
  @IsNotEmpty()
  rating!: number;
}
