import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { UsersService } from '../users/users.service';

@Controller('events-consumer')
export class EventsConsumerController {
  private readonly logger = new Logger('EventsConsumer');

  constructor(
    private readonly eventsService: EventsService,
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

  @EventPattern('events.created')
  async handleEventCreated(@Payload() payload: CreateEventDto) {
    this.logger.log('events.created received');
    try {
      await this.eventsService.create(payload);
      this.logger.log('Event persisted from consumer');
    } catch (err) {
      this.logger.error('Error persisting event from consumer', err as any);
    }
  }
}
