import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateSavedPostService } from './services/createSavedPost.service';
import { UsersService } from '../users/users.service';
import { AuthTokenGeneratedDto } from '../posts/dto/generatedToken.dto';

@Controller('saved-posts-consumer')
export class SavedPostsConsumerController {
  private readonly logger = new Logger('SavedPostsConsumer');

  constructor(
    private readonly createSavedPostService: CreateSavedPostService,
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
