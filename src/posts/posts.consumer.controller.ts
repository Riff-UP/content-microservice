import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuthTokenGeneratedDto } from './dto/generatedToken.dto';
import { createPostService } from './services/createPost.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts-consumer')
export class postsConsumerController {
  private readonly logger = new Logger('PostsConsumer');

  constructor(private readonly createPostService: createPostService) {}

  @EventPattern('auth.tokenGenerated')
  async handleAuthToken(@Payload() data: AuthTokenGeneratedDto) {
    this.logger.log('Evento auth.tokenGenerated recibido en consumer');
    const { user, token } = data;
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
