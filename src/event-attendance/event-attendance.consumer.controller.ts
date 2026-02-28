import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { EventAttendanceService } from './event-attendance.service';

@Controller('event-attendance-consumer')
export class EventAttendanceConsumerController {
  private readonly logger = new Logger('EventAttendanceConsumer');

  constructor(
    private readonly eventAttendanceService: EventAttendanceService,
  ) {}

  @EventPattern('events.attendanceCreated')
  async handleAttendanceCreated(@Payload() payload: CreateEventAttendanceDto) {
    this.logger.log('events.attendanceCreated received');
    try {
      await this.eventAttendanceService.create(payload);
      this.logger.log('Event attendance persisted from consumer');
    } catch (err) {
      this.logger.error(
        'Error persisting attendance from consumer',
        err as any,
      );
    }
  }
}
