import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { SavedPostsService } from './saved-posts.service';
import { UsersService } from '../users/users.service';

@Controller('saved-posts-consumer')
export class SavedPostsConsumerController {
  private readonly logger = new Logger('SavedPostsConsumer');

  constructor(
    private readonly savedPostsService: SavedPostsService,
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

  @EventPattern('posts.saved')
  async handlePostSaved(@Payload() payload: CreateSavedPostDto) {
    this.logger.log('posts.saved received');
    try {
      await this.savedPostsService.create(payload);
      this.logger.log('Saved post persisted from consumer');
    } catch (err) {
      this.logger.error(
        'Error persisting saved post from consumer',
        err as any,
      );
    }
  }
}
