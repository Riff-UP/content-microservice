import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventService } from './services/createEvent.service';
import { CancelEventsByUserService } from './services/cancelEventsByUser.service';
import { UsersService } from '../users/users.service';
import { AuthTokenGeneratedDto } from '../posts/dto/generatedToken.dto';

@Controller('events-consumer')
export class EventsConsumerController {
  private readonly logger = new Logger('EventsConsumer');

  constructor(
    private readonly createEventService: CreateEventService,
    private readonly cancelEventsByUserService: CancelEventsByUserService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: any) {
    this.logger.log('auth.tokenGenerated received', JSON.stringify(data));

    try {
      // Normalizar estructura: el gateway puede enviar { user: { id }, token } o { userId, token }
      const normalized = {
        userId: data.userId || data.user?.id,
        token: data.token,
        email: data.email || data.user?.email || 'unknown@event.local',
        name: data.name || data.user?.name || 'Event User',
        role: data.role || data.user?.role || 'user',
      };

      if (!normalized.userId) {
        this.logger.error('Invalid auth.tokenGenerated payload: missing userId', data);
        return;
      }

      await this.usersService.upsert(normalized);
      this.logger.log(`User ref upserted: ${normalized.userId}`);
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err);
    }
  }

  @EventPattern('user.deactivated')
  async handleUserDeactivated(@Payload() data: { userId: string }) {
    this.logger.log(`user.deactivated received for user ${data.userId}`);
    try {
      const count = await this.cancelEventsByUserService.execute(data.userId);
      this.logger.log(
        `Cancelled ${count} events for deactivated user ${data.userId}`,
      );
    } catch (err) {
      this.logger.error('Failed to cancel events for user', err);
    }
  }
}
