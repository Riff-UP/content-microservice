import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateSavedPostService } from './services/createSavedPost.service';
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

@Controller('saved-posts-consumer')
export class SavedPostsConsumerController {
  private readonly logger = new Logger('SavedPostsConsumer');

  constructor(
    private readonly createSavedPostService: CreateSavedPostService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: EventPayloadWithUser) {
    this.logger.log(
      '=== auth.tokenGenerated received in SavedPostsConsumer ===',
    );
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
}
