import { Injectable } from '@nestjs/common';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';

@Injectable()
export class PostReactionsService {
  create(createPostReactionDto: CreatePostReactionDto) {
    return 'This action adds a new postReaction';
  }

  remove(id: number) {
    return `This action removes a #${id} postReaction`;
  }
}
