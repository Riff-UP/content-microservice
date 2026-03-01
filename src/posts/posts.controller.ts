import { Controller, Logger } from '@nestjs/common';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostsService } from './services/posts.service';
import { createPostService } from './services/createPost.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private readonly postsService: PostsService,
    private readonly createPostService: createPostService,
    private readonly usersService: UsersService,
  ) { }

  @MessagePattern('createPost')
  async create(@Payload() createPostDto: CreatePostDto) {
    // Look up user replica (Event-Carried State Transfer)
    const userRef = await this.usersService.get(createPostDto.sql_user_id);
    if (!userRef) {
      this.logger.error(
        `No user ref found for ${createPostDto.sql_user_id}. ` +
        'Ensure auth.tokenGenerated was received.',
      );
      throw new Error('User not replicated yet. Authenticate first.');
    }

    return this.createPostService.create(createPostDto, {
      _token: userRef.token,
    });
  }

  @MessagePattern('findAllPosts')
  findAll() {
    return this.postsService.findAll();
  }

  @MessagePattern('findOnePost')
  findOne(@Payload() id: string) {
    return this.postsService.findOne(id);
  }

  @MessagePattern('updatePost')
  update(@Payload() updatePostDto: UpdatePostDto) {
    return this.postsService.update(updatePostDto.id, updatePostDto);
  }

  @MessagePattern('removePost')
  remove(@Payload() id: string) {
    return this.postsService.remove(id);
  }
}