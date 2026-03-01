import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsConsumerController } from './events.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { UsersModule } from '../users/users.module';
import { CreateEventService } from './services/createEvent.service';
import { FindAllEventsService } from './services/findAllEvents.service';
import { FindOneEventService } from './services/findOneEvent.service';
import { UpdateEventService } from './services/updateEvent.service';
import { RemoveEventService } from './services/removeEvent.service';

@Module({
  controllers: [EventsController, EventsConsumerController],
  providers: [
    CreateEventService,
    FindAllEventsService,
    FindOneEventService,
    UpdateEventService,
    RemoveEventService,
  ],
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    UsersModule,
  ],
})
export class EventsModule {}
