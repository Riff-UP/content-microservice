import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { UpdateEventReviewDto } from './dto/update-event-review.dto';
import { CreateEventReviewService } from './services/createEventReview.service';
import { FindReviewsByEventService } from './services/findReviewsByEvent.service';
import { FindOneEventReviewService } from './services/findOneEventReview.service';
import { UpdateEventReviewService } from './services/updateEventReview.service';
import { RemoveEventReviewService } from './services/removeEventReview.service';

@Controller()
export class EventReviewsController {
  constructor(
    private readonly createEventReviewService: CreateEventReviewService,
    private readonly findReviewsByEventService: FindReviewsByEventService,
    private readonly findOneEventReviewService: FindOneEventReviewService,
    private readonly updateEventReviewService: UpdateEventReviewService,
    private readonly removeEventReviewService: RemoveEventReviewService,
  ) {}

  @MessagePattern('createEventReview')
  create(@Payload() dto: CreateEventReviewDto) {
    return this.createEventReviewService.execute(dto);
  }

  @MessagePattern('findReviewsByEvent')
  findByEvent(@Payload() payload: { event_id: string }) {
    return this.findReviewsByEventService.execute(payload.event_id);
  }

  @MessagePattern('findOneEventReview')
  findOne(@Payload() payload: { id: string }) {
    return this.findOneEventReviewService.execute(payload.id);
  }

  @MessagePattern('updateEventReview')
  update(@Payload() dto: UpdateEventReviewDto) {
    return this.updateEventReviewService.execute(dto.id, dto);
  }

  @MessagePattern('removeEventReview')
  remove(@Payload() payload: { id: string }) {
    return this.removeEventReviewService.execute(payload.id);
  }
}
