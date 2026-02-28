import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReaction } from './schemas/post-reactions.schema';
import { CreatePostReactionDto } from './dto/create-post-reaction.dto';

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
}
