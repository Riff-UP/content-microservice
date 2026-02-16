import { Injectable } from '@nestjs/common';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostReaction } from './schemas/post-reactions.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostReactionsService {

  constructor(
    @InjectModel(PostReaction.name) private readonly postReactionService: Model<PostReaction>
  ){}

  async create(createPostReactionDto: CreatePostReactionDto) {
    return await this.postReactionService.create(createPostReactionDto)
  }

  async remove(id: number) {
    const deletedReaction = await this.postReactionService.findByIdAndDelete(id).exec()

    if(!deletedReaction){
      throw new Error(`Reaction with id ${id} not found`)
    }
    return deletedReaction
  }
}
