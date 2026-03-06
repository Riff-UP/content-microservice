import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { SoftDeletePostsByUserService } from './services/softDeletePostsByUser.service';

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

@Controller('posts-consumer')
export class postsConsumerController {
  private readonly logger = new Logger('PostsConsumer');

  constructor(
    private readonly usersService: UsersService,
    private readonly softDeletePostsByUserService: SoftDeletePostsByUserService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: EventPayloadWithUser) {
    this.logger.log('auth.tokenGenerated received', JSON.stringify(data));

    try {
      // Normalizar estructura: el gateway puede enviar { user: { id }, token } o { userId, token }
      const normalized = {
        userId: data.userId || data.user?.id || '',
        token: data.token || '',
        email: data.email || data.user?.email || 'unknown@event.local',
        name: data.name || data.user?.name || 'Event User',
        role: data.role || data.user?.role || 'user',
      };

      if (!normalized.userId) {
        this.logger.error(
          'Invalid auth.tokenGenerated payload: missing userId',
          data,
        );
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
      const count = await this.softDeletePostsByUserService.execute(
        data.userId,
      );
      this.logger.log(
        `Soft deleted ${count} posts for deactivated user ${data.userId}`,
      );
    } catch (err) {
      this.logger.error('Failed to soft delete posts for user', err);
    }
  }
}
