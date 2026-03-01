import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { PostReactionsService } from './post-reactions.service';
import { UsersService } from '../users/users.service';

@Controller('post-reactions-consumer')
export class PostReactionsConsumerController {
  private readonly logger = new Logger('PostReactionsConsumer');

  constructor(
    private readonly postReactionsService: PostReactionsService,
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
