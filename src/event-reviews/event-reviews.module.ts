import { Module } from '@nestjs/common';
import { EventReviewsService } from './event-reviews.service';
import { EventReviewsController } from './event-reviews.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventReview, EventReviewSchema } from './schemas/event-reviews.schema';

@Module({
  controllers: [EventReviewsController],
  providers: [EventReviewsService],
  imports: [
    MongooseModule.forFeature([{name: EventReview.name, schema: EventReviewSchema}])
  ]
})
export class EventReviewsModule {}
