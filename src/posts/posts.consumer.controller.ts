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
      await this.usersService.upsert(user as any);
      this.logger.log(`User ref upserted: ${user?.id}`);
    } catch (err) {
      this.logger.error('Failed to upsert user ref', err as any);
    }
  }

  @EventPattern('posts.created')
  async handlePostCreated(@Payload() payload: CreatePostDto) {
    this.logger.log('posts.created evento recibido en consumer');
    try {
      const post = await this.createPostService.create(payload);
      this.logger.log(`Post persisted: ${post.id}`);
    } catch (err) {
      this.logger.error('Error creating post from consumer', err as any);
    }
  }
}
