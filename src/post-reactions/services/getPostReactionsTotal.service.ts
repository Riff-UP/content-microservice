import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PostReaction,
  PostReactionDocument,
} from '../schemas/post-reactions.schema';

type PostReactionsTotalResult = {
  postId: string;
  totalReactions: number;
};

@Injectable()
export class GetPostReactionsTotalService {
  private readonly logger = new Logger(GetPostReactionsTotalService.name);

  constructor(
    @InjectModel(PostReaction.name)
    private readonly postReactionModel: Model<PostReactionDocument>,
  ) {}

  /**
   * Returns total reactions for a specific post.
   */
  async execute(postId: string): Promise<PostReactionsTotalResult> {
    const totalReactions = await this.postReactionModel.countDocuments({
      post_id: postId,
    });

    this.logger.log(
      `Computed total reactions for post ${postId}: ${totalReactions}`,
    );

    return {
      postId,
      totalReactions,
    };
  }
}