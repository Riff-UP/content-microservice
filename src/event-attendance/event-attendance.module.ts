import { Module } from '@nestjs/common';
import { EventAttendanceController } from './event-attendance.controller';
import { EventAttendanceConsumerController } from './event-attendance.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventAttendance,
  EventAttendanceSchema,
} from './schemas/event-attendance.schema';
import { UsersModule } from '../users/users.module';
import { CreateEventAttendanceService } from './services/createEventAttendance.service';
import { FindAttendanceByEventService } from './services/findAttendanceByEvent.service';
import { FindOneEventAttendanceService } from './services/findOneEventAttendance.service';
import { UpdateEventAttendanceService } from './services/updateEventAttendance.service';
import { RemoveEventAttendanceService } from './services/removeEventAttendance.service';

@Module({
  controllers: [EventAttendanceController, EventAttendanceConsumerController],
  providers: [
    CreateEventAttendanceService,
    FindAttendanceByEventService,
    FindOneEventAttendanceService,
    UpdateEventAttendanceService,
    RemoveEventAttendanceService,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: EventAttendance.name, schema: EventAttendanceSchema },
    ]),
    UsersModule,
  ],
})
export class EventAttendanceModule {}
