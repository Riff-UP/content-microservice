import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostReactionsService } from './post-reactions.service';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';

@Controller()
export class PostReactionsController {
  constructor(private readonly postReactionsService: PostReactionsService) {}

  @MessagePattern('createPostReaction')
  create(@Payload() createPostReactionDto: CreatePostReactionDto) {
    return this.postReactionsService.create(createPostReactionDto);
  }

  @MessagePattern('removePostReaction')
  remove(@Payload() id: number) {
    return this.postReactionsService.remove(id);
  }
}
