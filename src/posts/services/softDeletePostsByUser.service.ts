import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';

@Injectable()
export class SoftDeletePostsByUserService {
  private readonly logger = new Logger(SoftDeletePostsByUserService.name);

  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Soft delete all posts by a specific user (set deleted_at timestamp).
   */
  async execute(userId: string): Promise<number> {
    const result = await this.postModel.updateMany(
      { sql_user_id: userId, deleted_at: { $exists: false } },
      { $set: { deleted_at: new Date() } },
    );

    this.logger.log(
      `Soft deleted ${result.modifiedCount} posts for user ${userId}`,
    );
    return result.modifiedCount;
  }
}
