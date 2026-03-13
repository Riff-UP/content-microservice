import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { UpdateEventReviewDto } from './dto/update-event-review.dto';
import { CreateEventReviewService } from './services/createEventReview.service';
import { FindAllEventReviewsService } from './services/findAllEventReviews.service';
import { FindReviewsByEventService } from './services/findReviewsByEvent.service';
import { FindReviewsByUserService } from './services/findReviewsByUser.service';
import { FindOneEventReviewService } from './services/findOneEventReview.service';
import { UpdateEventReviewService } from './services/updateEventReview.service';
import { RemoveEventReviewService } from './services/removeEventReview.service';

@Controller()
export class EventReviewsController {
  private readonly logger = new Logger(EventReviewsController.name);

  constructor(
    private readonly createEventReviewService: CreateEventReviewService,
    private readonly findAllEventReviewsService: FindAllEventReviewsService,
    private readonly findReviewsByEventService: FindReviewsByEventService,
    private readonly findReviewsByUserService: FindReviewsByUserService,
    private readonly findOneEventReviewService: FindOneEventReviewService,
    private readonly updateEventReviewService: UpdateEventReviewService,
    private readonly removeEventReviewService: RemoveEventReviewService,
  ) {}

  @MessagePattern('createEventReview')
  create(@Payload() payload: any) {
    const dto: CreateEventReviewDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };
    return this.createEventReviewService.execute(dto);
  }

  @MessagePattern('findAllEventReviews')
  findAll() {
    return this.findAllEventReviewsService.execute();
  }

  @MessagePattern('findReviewsByEvent')
  findByEvent(@Payload() payload: { event_id: string }) {
    return this.findReviewsByEventService.execute(payload.event_id);
  }

  @MessagePattern('findReviewsByUser')
  findByUser(@Payload() payload: { userId: string }) {
    return this.findReviewsByUserService.execute(payload.userId);
  }

  @MessagePattern('findOneEventReview')
  findOne(@Payload() payload: { id: string }) {
    return this.findOneEventReviewService.execute(payload.id);
  }

  @MessagePattern('updateEventReview')
  update(@Payload() payload: any) {
    const dto: UpdateEventReviewDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };
    return this.updateEventReviewService.execute(dto.id, dto);
  }

  @MessagePattern('removeEventReview')
  remove(@Payload() payload: { id: string }) {
    return this.removeEventReviewService.execute(payload.id);
  }
}