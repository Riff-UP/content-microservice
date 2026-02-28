import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsConsumerController } from './events.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';

@Module({
  controllers: [EventsController, EventsConsumerController],
  providers: [EventsService],
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
})
export class EventsModule {}
