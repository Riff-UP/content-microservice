import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PostReaction,
  PostReactionDocument,
} from '../schemas/post-reactions.schema';

@Injectable()
export class FindReactionsByUserService {
  private readonly logger = new Logger(FindReactionsByUserService.name);

  constructor(
    @InjectModel(PostReaction.name)
    private readonly postReactionModel: Model<PostReactionDocument>,
  ) {}

  async execute(sqlUserId: string): Promise<PostReactionDocument[]> {
    const reactions = await this.postReactionModel
      .find({ sql_user_id: sqlUserId })
      .sort({ created_at: -1 })
      .exec();

    this.logger.log(
      `Found ${reactions.length} reactions for user ${sqlUserId}`,
    );
    return reactions;
  }
}
