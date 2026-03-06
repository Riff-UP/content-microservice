import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PostReaction,
  PostReactionDocument,
} from '../schemas/post-reactions.schema';

@Injectable()
export class FindReactionsByPostService {
  private readonly logger = new Logger(FindReactionsByPostService.name);

  constructor(
    @InjectModel(PostReaction.name)
    private readonly postReactionModel: Model<PostReactionDocument>,
  ) {}

  /**
   * Returns all reactions for a specific post.
   */
  async execute(postId: string): Promise<PostReactionDocument[]> {
    const reactions = await this.postReactionModel
      .find({ post_id: postId })
      .exec();

    this.logger.log(`Found ${reactions.length} reactions for post ${postId}`);
    return reactions;
  }
}
