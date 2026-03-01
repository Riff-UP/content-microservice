import { Module } from '@nestjs/common';
import { EventReviewsService } from './event-reviews.service';
import { EventReviewsController } from './event-reviews.controller';
import { EventReviewsConsumerController } from './event-reviews.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventReview, EventReviewSchema } from './schemas/event-reviews.schema';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [EventReviewsController, EventReviewsConsumerController],
  providers: [EventReviewsService],
  imports: [
    MongooseModule.forFeature([
      { name: EventReview.name, schema: EventReviewSchema },
    ]),
    UsersModule,
  ],
})
export class EventReviewsModule {}
