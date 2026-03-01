import { Module } from '@nestjs/common';
import { EventReviewsController } from './event-reviews.controller';
import { EventReviewsConsumerController } from './event-reviews.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventReview, EventReviewSchema } from './schemas/event-reviews.schema';
import { UsersModule } from '../users/users.module';
import { CreateEventReviewService } from './services/createEventReview.service';
import { FindReviewsByEventService } from './services/findReviewsByEvent.service';
import { FindOneEventReviewService } from './services/findOneEventReview.service';
import { UpdateEventReviewService } from './services/updateEventReview.service';
import { RemoveEventReviewService } from './services/removeEventReview.service';

@Module({
  controllers: [EventReviewsController, EventReviewsConsumerController],
  providers: [
    CreateEventReviewService,
    FindReviewsByEventService,
    FindOneEventReviewService,
    UpdateEventReviewService,
    RemoveEventReviewService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: EventReview.name, schema: EventReviewSchema },
    ]),
    UsersModule,
  ],
})
export class EventReviewsModule {}
