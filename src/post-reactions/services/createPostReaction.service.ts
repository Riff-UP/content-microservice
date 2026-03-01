import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PostReaction,
  PostReactionDocument,
} from '../schemas/post-reactions.schema';
import { CreatePostReactionDto } from '../dto/create-post-reaction.dto';

@Injectable()
export class CreatePostReactionService {
  private readonly logger = new Logger(CreatePostReactionService.name);

  constructor(
    @InjectModel(PostReaction.name)
    private readonly postReactionModel: Model<PostReactionDocument>,
  ) {}

  /**
   * Toggle a reaction: if the same user+post+type already exists, remove it (un-react);
   * otherwise create it. Returns the created/deleted document and an `action` flag.
   */
  async execute(
    dto: CreatePostReactionDto,
  ): Promise<{
    reaction: PostReactionDocument | null;
    action: 'created' | 'removed';
  }> {
    const existing = await this.postReactionModel
      .findOne({
        sql_user_id: dto.sql_user_id,
        post_id: dto.post_id,
        type: dto.type,
      })
      .exec();

    if (existing) {
      await this.postReactionModel.findByIdAndDelete(existing._id).exec();
      this.logger.log(
        `Reaction removed (toggle): user ${dto.sql_user_id} on post ${dto.post_id}`,
      );
      return { reaction: existing, action: 'removed' };
    }

    const reaction = await this.postReactionModel.create(dto);
    this.logger.log(
      `Reaction created: user ${dto.sql_user_id} on post ${dto.post_id} [${dto.type}]`,
    );
    return { reaction, action: 'created' };
  }
}
