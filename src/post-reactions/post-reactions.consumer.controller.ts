import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { PostReactionsService } from './post-reactions.service';

@Controller('post-reactions-consumer')
export class PostReactionsConsumerController {
  private readonly logger = new Logger('PostReactionsConsumer');

  constructor(private readonly postReactionsService: PostReactionsService) {}

  @EventPattern('posts.reactionCreated')
  async handleReactionCreated(@Payload() payload: CreatePostReactionDto) {
    this.logger.log('posts.reactionCreated received');
    try {
      await this.postReactionsService.create(payload);
      this.logger.log('Post reaction persisted from consumer');
    } catch (err) {
      this.logger.error(
        'Error persisting post reaction from consumer',
        err as any,
      );
    }
  }
}
