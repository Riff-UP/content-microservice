import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthTokenGeneratedDto } from './dto/generatedToken.dto';
import { createPostService } from './services/createPost.service';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts-consumer')
export class postsConsumerController {
  private readonly logger = new Logger('PostsConsumer');

  constructor(
    private readonly createPostService: createPostService,
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: AuthTokenGeneratedDto) {
    this.logger.log('Evento auth.tokenGenerated recibido en consumer');
    const { user, token } = data;
    try {
      // store token together with user in cache so other handlers can use it
      const merged = { ...(user as any), _token: token };
      await this.usersService.upsert(merged as any);
      this.logger.log(`User ref upserted: ${merged?.user_id}`);
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err as any);
    }
  }

  @EventPattern('posts.created')
  async handlePostCreated(@Payload() payload: CreatePostDto) {
    this.logger.log('posts.created evento recibido en consumer');
    try {
      // Try to fetch cached auth info for this user
      const cached = await this.usersService.get(payload.sql_user_id as any);
      if (!cached || !cached._token) {
        this.logger.error(
          `No auth token cached for user ${payload.sql_user_id}, skipping post creation`,
        );
        return;
      }

      const post = await this.createPostService.create(payload, cached);
      this.logger.log(`Post persisted: ${post.id}`);
    } catch (err) {
      this.logger.error('Error creating post from consumer', err as any);
    }
  }
}
