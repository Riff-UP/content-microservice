import { Module } from '@nestjs/common';
import { EventReviewsService } from './event-reviews.service';
import { EventReviewsController } from './event-reviews.controller';

@Module({
  controllers: [EventReviewsController],
  providers: [EventReviewsService],
})
export class EventReviewsModule {}
