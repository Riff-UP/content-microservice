import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { createPostService } from './services/createPost.service';
import { FindAllPostsService } from './services/findAllPosts.service';
import { FindOnePostService } from './services/findOnePost.service';
import { UpdatePostService } from './services/updatePost.service';
import { RemovePostService } from './services/removePost.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';
import { UserRefDocument } from '../users/schemas/user-ref.schema';

@Controller()
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(
    private readonly createPostService: createPostService,
    private readonly findAllPostsService: FindAllPostsService,
    private readonly findOnePostService: FindOnePostService,
    private readonly updatePostService: UpdatePostService,
    private readonly removePostService: RemovePostService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern('createPost')
  async create(@Payload() createPostDto: CreatePostDto) {
    // Look up user replica (Event-Carried State Transfer)
    const userRef: UserRefDocument | null = await this.usersService.get(
      createPostDto.sql_user_id,
    );
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
    return this.findAllPostsService.execute();
  }

  @MessagePattern('findOnePost')
  findOne(@Payload() id: string) {
    return this.findOnePostService.execute(id);
  }

  @MessagePattern('updatePost')
  update(@Payload() updatePostDto: UpdatePostDto) {
    return this.updatePostService.execute(updatePostDto.id, updatePostDto);
  }

  @MessagePattern('removePost')
  remove(@Payload() id: string) {
    return this.removePostService.execute(id);
  }
}
