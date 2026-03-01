import { PartialType } from '@nestjs/mapped-types';
import { CreateEventReviewDto } from './create-event-review.dto';

export class UpdateEventReviewDto extends PartialType(CreateEventReviewDto) {
  id: string;
}
