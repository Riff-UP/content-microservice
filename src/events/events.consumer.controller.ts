import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateEventService } from './services/createEvent.service';
import { CancelEventsByUserService } from './services/cancelEventsByUser.service';
import { UsersService } from '../users/users.service';

interface EventPayloadWithUser {
  userId?: string;
  token?: string;
  email?: string;
  name?: string;
  role?: string;
  googleId?: string;
  picture?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    googleId?: string;
    picture?: string;
  };
}

@Controller('events-consumer')
export class EventsConsumerController {
  private readonly logger = new Logger('EventsConsumer');

  constructor(
    private readonly createEventService: CreateEventService,
    private readonly cancelEventsByUserService: CancelEventsByUserService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: EventPayloadWithUser) {
    this.logger.log('=== auth.tokenGenerated received in EventsConsumer ===');
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);

    try {
      // Normalizar estructura: el gateway puede enviar { user: { id }, token } o { userId, token }
      const normalized = {
        userId: data.userId || data.user?.id || '',
        token: data.token || '',
        email: data.email || data.user?.email || '',
        name: data.name || data.user?.name || '',
        role: data.role || data.user?.role || '',
        googleId: data.googleId || data.user?.googleId || '',
        picture: data.picture || data.user?.picture || '',
      };

      if (!normalized.userId) {
        this.logger.error('❌ Invalid payload: missing userId', data);
        return;
      }

      const result = await this.usersService.upsert(normalized);
      this.logger.log(
        `✅ User ref upserted successfully: ${normalized.userId}`,
      );
      this.logger.debug(`Upsert result: ${JSON.stringify(result)}`);
    } catch (err) {
      this.logger.error('❌ Failed to upsert user ref', err);
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
