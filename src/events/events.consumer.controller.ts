import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventService } from './services/createEvent.service';
import { UsersService } from '../users/users.service';

@Controller('events-consumer')
export class EventsConsumerController {
  private readonly logger = new Logger('EventsConsumer');

  constructor(
    private readonly createEventService: CreateEventService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: { user: any; token: string }) {
    this.logger.log('auth.tokenGenerated received');
    try {
      await this.usersService.upsert(data.user, data.token);
      this.logger.log(
        `User ref upserted: ${data.user?.id || data.user?.user_id}`,
      );
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err as any);
    }
  }
}
