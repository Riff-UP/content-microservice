import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PostReaction,
  PostReactionDocument,
} from '../schemas/post-reactions.schema';

@Injectable()
export class FindReactionsByPostAndUserService {
  private readonly logger = new Logger(FindReactionsByPostAndUserService.name);

  constructor(
    @InjectModel(PostReaction.name)
    private readonly postReactionModel: Model<PostReactionDocument>,
  ) {}

  /**
   * Returns the reactions of a specific user on a specific post.
   * Useful to check if a user already reacted to a post.
   * Accepts userId (gateway UUID) mapped to sql_user_id and postId mapped to post_id.
   */
  async execute(
    sqlUserId: string,
    postId: string,
  ): Promise<PostReactionDocument[]> {
    const reactions = await this.postReactionModel
      .find({ sql_user_id: sqlUserId, post_id: postId })
      .exec();

    this.logger.log(
      `Found ${reactions.length} reactions for user ${sqlUserId} on post ${postId}`,
    );
    return reactions;
  }
}

