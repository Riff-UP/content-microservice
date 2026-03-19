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
import { RpcExceptionHelper, PaginationDto } from '../common';

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
  async create(@Payload() payload: any) {
    this.logger.log(
      `📥 Received createPost with payload: ${JSON.stringify(payload)}`,
    );

    // Transform userId to sql_user_id if needed
    const createPostDto: CreatePostDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };

    this.logger.log(
      `🔄 Transformed DTO with sql_user_id: ${createPostDto.sql_user_id}`,
    );

    // Look up user replica (Event-Carried State Transfer).
    // It's possible auth.tokenGenerated hasn't been processed yet by this service
    // due to async event delivery. Try a short poll before failing.
    let userRef: UserRefDocument | null = await this.usersService.get(
      createPostDto.sql_user_id,
    );
    if (!userRef) {
      const maxAttempts = 5;
      const delayMs = 200;
      for (let i = 0; i < maxAttempts && !userRef; i++) {
        await new Promise((res) => setTimeout(res, delayMs));
        userRef = await this.usersService.get(createPostDto.sql_user_id);
      }
    }

    if (!userRef) {
      this.logger.error(
        `No user ref found for ${createPostDto.sql_user_id}. Ensure auth.tokenGenerated was received.`,
      );
      RpcExceptionHelper.unauthorized(
        'User not replicated yet. Authenticate first.',
      );
      return; // unreachable — RpcExceptionHelper throws, but helps TS narrowing
    }

    return this.createPostService.create(createPostDto, {
      _token: userRef.token,
    }, {
      name: userRef.name,
      slug: userRef.slug,
      picture: userRef.picture,
    });
  }

  @MessagePattern('findAllPosts')
  findAll(@Payload() pagination: PaginationDto) {
    return this.findAllPostsService.execute(pagination);
  }

  @MessagePattern('findPostsByUser')
  findByUser(@Payload() payload: { userId: string }) {
    // Mapear userId (UUID del gateway) a sql_user_id del esquema
    const sqlUserId = payload.userId;
    this.logger.log(`findPostsByUser - sql_user_id: ${sqlUserId}`);
    return this.findAllPostsService.byUser(sqlUserId);
  }

  @MessagePattern('findOnePost')
  findOne(@Payload() id: string) {
    return this.findOnePostService.execute(id);
  }

  @MessagePattern('updatePost')
  update(@Payload() payload: any) {
    this.logger.log(
      `📥 Received updatePost with payload: ${JSON.stringify(payload)}`,
    );

    // Transform userId to sql_user_id if needed
    const updatePostDto: UpdatePostDto = {
      ...payload,
      sql_user_id: payload.sql_user_id || payload.userId,
    };

    this.logger.log(
      `🔄 Transformed DTO with sql_user_id: ${updatePostDto.sql_user_id}`,
    );
    return this.updatePostService.execute(updatePostDto.id, updatePostDto);
  }

  @MessagePattern('removePost')
  remove(@Payload() id: string) {
    return this.removePostService.execute(id);
  }
}
