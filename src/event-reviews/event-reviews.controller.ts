import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventReviewsService } from './event-reviews.service';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { UpdateEventReviewDto } from './dto/update-event-review.dto';

@Controller()
export class EventReviewsController {
  constructor(private readonly eventReviewsService: EventReviewsService) {}

  @MessagePattern('createEventReview')
  create(@Payload() createEventReviewDto: CreateEventReviewDto) {
    return this.eventReviewsService.create(createEventReviewDto);
  }

  @MessagePattern('findAllEventReviews')
  findAll() {
    return this.eventReviewsService.findAll();
  }

  @MessagePattern('findOneEventReview')
  findOne(@Payload() id: string) {
    return this.eventReviewsService.findOne(id);
  }

  @MessagePattern('updateEventReview')
  update(@Payload() updateEventReviewDto: UpdateEventReviewDto) {
    return this.eventReviewsService.update(
      updateEventReviewDto.id,
      updateEventReviewDto,
    );
  }

  @MessagePattern('removeEventReview')
  remove(@Payload() id: string) {
    return this.eventReviewsService.remove(id);
  }
}