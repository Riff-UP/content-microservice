import { Module } from '@nestjs/common';
import { EventAttendanceService } from './event-attendance.service';
import { EventAttendanceController } from './event-attendance.controller';

@Module({
  controllers: [EventAttendanceController],
  providers: [EventAttendanceService],
})
export class EventAttendanceModule {}
