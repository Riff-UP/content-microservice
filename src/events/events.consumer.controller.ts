import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventService } from './services/createEvent.service';
import { UsersService } from '../users/users.service';
import { AuthTokenGeneratedDto } from '../posts/dto/generatedToken.dto';

@Controller('events-consumer')
export class EventsConsumerController {
  private readonly logger = new Logger('EventsConsumer');

  constructor(
    private readonly createEventService: CreateEventService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: AuthTokenGeneratedDto) {
    this.logger.log('auth.tokenGenerated received');
    try {
      await this.usersService.upsert(data.user, data.token);
      this.logger.log(
        `User ref upserted: ${data.user?.id || data.user?.user_id}`,
      );
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err);
    }
  }
}
