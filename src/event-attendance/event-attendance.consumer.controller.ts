import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { EventAttendanceService } from './event-attendance.service';
import { UsersService } from '../users/users.service';

@Controller('event-attendance-consumer')
export class EventAttendanceConsumerController {
  private readonly logger = new Logger('EventAttendanceConsumer');

  constructor(
    private readonly eventAttendanceService: EventAttendanceService,
    private readonly usersService: UsersService,
  ) { }

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: { user: any; token: string }) {
    this.logger.log('auth.tokenGenerated received');
    try {
      await this.usersService.upsert(data.user, data.token);
      this.logger.log(`User ref upserted: ${data.user?.id || data.user?.user_id}`);
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err as any);
    }
  }

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
