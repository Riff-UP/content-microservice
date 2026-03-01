import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { CreateSavedPostService } from './services/createSavedPost.service';
import { UsersService } from '../users/users.service';

@Controller('saved-posts-consumer')
export class SavedPostsConsumerController {
  private readonly logger = new Logger('SavedPostsConsumer');

  constructor(
    private readonly createSavedPostService: CreateSavedPostService,
    private readonly usersService: UsersService,
  ) { }

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
