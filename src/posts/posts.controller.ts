import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { createPostService } from './services/createPost.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from '../users/users.service';

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private readonly createPostService: createPostService,
    private readonly usersService: UsersService,
  ) { }

  @MessagePattern('createPost')
  async create(@Payload() createPostDto: CreatePostDto) {
    // Look up cached auth info (token + user) from auth.tokenGenerated event
    const cached = await this.usersService.get(
      Number(createPostDto.sql_user_id),
    );

    if (!cached || !cached._token) {
      this.logger.error(
        `No cached auth token for user ${createPostDto.sql_user_id}. ` +
        'Ensure auth.tokenGenerated was received before creating a post.',
      );
      throw new Error(
        'Auth token not available. User must be authenticated first.',
      );
    }

    return this.createPostService.create(createPostDto, cached);
  }
}
