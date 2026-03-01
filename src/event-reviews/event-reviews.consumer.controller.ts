import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { EventReviewsService } from './event-reviews.service';
import { UsersService } from '../users/users.service';

@Controller('event-reviews-consumer')
export class EventReviewsConsumerController {
  private readonly logger = new Logger('EventReviewsConsumer');

  constructor(
    private readonly eventReviewsService: EventReviewsService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: { user: any; token: string }) {
    this.logger.log('auth.tokenGenerated received');
    try {
      await this.usersService.upsert(data.user, data.token);
      this.logger.log(
        `User ref upserted: ${data.user?.id || data.user?.user_id}`,
      );
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err as any);
    }
  }

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
