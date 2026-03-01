import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { CreatePostReactionService } from './services/createPostReaction.service';
import { FindReactionsByPostService } from './services/findReactionsByPost.service';
import { RemovePostReactionService } from './services/removePostReaction.service';

@Controller()
export class PostReactionsController {
  constructor(
    private readonly createPostReactionService: CreatePostReactionService,
    private readonly findReactionsByPostService: FindReactionsByPostService,
    private readonly removePostReactionService: RemovePostReactionService,
  ) {}

  @MessagePattern('createPostReaction')
  create(@Payload() dto: CreatePostReactionDto) {
    return this.createPostReactionService.execute(dto);
  }

  @MessagePattern('findReactionsByPost')
  findByPost(@Payload() payload: { post_id: string }) {
    return this.findReactionsByPostService.execute(payload.post_id);
  }

  @MessagePattern('removePostReaction')
  remove(@Payload() payload: { id: string }) {
    return this.removePostReactionService.execute(payload.id);
  }
}
