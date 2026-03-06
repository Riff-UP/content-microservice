import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { CreatePostReactionService } from './services/createPostReaction.service';
import { FindReactionsByPostService } from './services/findReactionsByPost.service';
import { FindReactionsByUserService } from './services/findReactionsByUser.service';
import { RemovePostReactionService } from './services/removePostReaction.service';
import { FindReactionsByPostAndUserService } from './services/findReactionsByPostAndUser.service';

@Controller()
export class PostReactionsController {
  private readonly logger = new Logger(PostReactionsController.name);

  constructor(
    private readonly createPostReactionService: CreatePostReactionService,
    private readonly findReactionsByPostService: FindReactionsByPostService,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    private readonly findReactionsByUserService: FindReactionsByUserService,
    private readonly removePostReactionService: RemovePostReactionService,
    private readonly findReactionsByPostAndUserService: FindReactionsByPostAndUserService,
  ) {}

  @MessagePattern('createPostReaction')
  create(
    @Payload()
    payload: {
      postId?: string;
      post_id?: string;
      userId?: string;
      sql_user_id?: string;
      type: string;
    },
  ) {
    this.logger.log(`createPostReaction payload: ${JSON.stringify(payload)}`);
    const dto: CreatePostReactionDto = {
      post_id: payload.post_id ?? payload.postId ?? '',
      sql_user_id: payload.sql_user_id ?? payload.userId ?? '',
      type: payload.type,
    };
    this.logger.log(`createPostReaction dto: ${JSON.stringify(dto)}`);
    return this.createPostReactionService.execute(dto);
  }

  @MessagePattern('findReactionsByPost')
  findByPost(@Payload() payload: { post_id: string }) {
    return this.findReactionsByPostService.execute(payload.post_id);
  }

  @MessagePattern('findReactionsByUser')
  findByUser(@Payload() payload: { userId: string }) {
    const sql_user_id = payload.userId;
    this.logger.log(`findReactionsByUser - sql_user_id: ${sql_user_id}`);
    return this.findReactionsByUserService.execute(sql_user_id);
  }

  @MessagePattern('removePostReaction')
  remove(@Payload() payload: { id: string }) {
    return this.removePostReactionService.execute(payload.id);
  }

  @MessagePattern('findReactionsByPostAndUser')
  findByPostAndUser(
    @Payload() payload: { postId?: string; post_id?: string; userId?: string; sql_user_id?: string },
  ) {
    // Mapear postId → post_id y userId → sql_user_id
    const postId = payload.post_id ?? payload.postId ?? '';
    const sqlUserId = payload.sql_user_id ?? payload.userId ?? '';
    this.logger.log(
      `findReactionsByPostAndUser - post_id: ${postId}, sql_user_id: ${sqlUserId}`,
    );
    return this.findReactionsByPostAndUserService.execute(sqlUserId, postId);
  }
}

