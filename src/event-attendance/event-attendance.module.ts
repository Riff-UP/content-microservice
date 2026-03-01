import { Module } from '@nestjs/common';
import { EventAttendanceService } from './event-attendance.service';
import { EventAttendanceController } from './event-attendance.controller';
import { EventAttendanceConsumerController } from './event-attendance.consumer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EventAttendance,
  EventAttendanceSchema,
} from './schemas/event-attendance.schema';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [EventAttendanceController, EventAttendanceConsumerController],
  providers: [EventAttendanceService],
  imports: [
    MongooseModule.forFeature([
      { name: EventAttendance.name, schema: EventAttendanceSchema },
    ]),
    UsersModule,
  ],
})
export class EventAttendanceModule { }
