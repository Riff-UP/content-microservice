import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { SavedPostsService } from './saved-posts.service';

@Controller('saved-posts-consumer')
export class SavedPostsConsumerController {
  private readonly logger = new Logger('SavedPostsConsumer');

  constructor(private readonly savedPostsService: SavedPostsService) {}

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
