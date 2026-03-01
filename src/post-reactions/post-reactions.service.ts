import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReaction } from './schemas/post-reactions.schema';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';
import { RpcExceptionHelper } from 'src/common';

@Injectable()
export class PostReactionsService {
  constructor(
    @InjectModel(PostReaction.name)
    private readonly postReactionModel: Model<PostReaction>,
  ) {}

  async create(createDto: CreatePostReactionDto) {
    return await this.postReactionModel.create(createDto as any);
  }

  async findAll() {
    return this.postReactionModel.find().exec();
  }

  async remove(id: string) {
    const reaction = await this.postReactionModel.findByIdAndDelete(id).exec();
    if (!reaction) RpcExceptionHelper.notFound('PostReaction', id);
    return { message: `Reaction with id ${id} removed` };
  }
}
