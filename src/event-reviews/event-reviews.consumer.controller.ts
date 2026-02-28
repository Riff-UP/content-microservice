import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { EventReviewsService } from './event-reviews.service';

@Controller('event-reviews-consumer')
export class EventReviewsConsumerController {
  private readonly logger = new Logger('EventReviewsConsumer');

  constructor(private readonly eventReviewsService: EventReviewsService) {}

  @EventPattern('events.reviewCreated')
  async handleReviewCreated(@Payload() payload: CreateEventReviewDto) {
    this.logger.log('events.reviewCreated received');
    try {
      await this.eventReviewsService.create(payload);
      this.logger.log('Event review persisted from consumer');
    } catch (err) {
      this.logger.error('Error persisting review from consumer', err as any);
    }
  }
}
