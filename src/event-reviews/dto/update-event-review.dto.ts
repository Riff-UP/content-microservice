import { PartialType } from '@nestjs/mapped-types';
import { CreateEventReviewDto } from './create-event-review.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEventReviewDto extends PartialType(CreateEventReviewDto) {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
