import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventReviewDto } from './dto/create-event-review.dto';
import { CreateEventReviewService } from './services/createEventReview.service';
import { UsersService } from '../users/users.service';
import { AuthTokenGeneratedDto } from '../posts/dto/generatedToken.dto';

@Controller('event-reviews-consumer')
export class EventReviewsConsumerController {
  private readonly logger = new Logger('EventReviewsConsumer');

  constructor(
    private readonly createEventReviewService: CreateEventReviewService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: AuthTokenGeneratedDto) {
    this.logger.log('auth.tokenGenerated received');
    try {
      await this.usersService.upsert(data);
      this.logger.log(`User ref upserted: ${data.userId}`);
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err);
    }
  }

  @EventPattern('events.reviewCreated')
  async handleReviewCreated(@Payload() payload: CreateEventReviewDto) {
    this.logger.log('events.reviewCreated received');
    try {
      await this.createEventReviewService.execute(payload);
      this.logger.log('Event review persisted from consumer');
    } catch (err) {
      this.logger.error('Error persisting review from consumer', err);
    }
  }
}
