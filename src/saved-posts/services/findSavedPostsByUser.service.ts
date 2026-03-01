import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedPost, SavedPostDocument } from '../schemas/saved-post.schema';

@Injectable()
export class FindSavedPostsByUserService {
  private readonly logger = new Logger(FindSavedPostsByUserService.name);

  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPostDocument>,
  ) {}

  /**
   * Returns all saved posts for a specific user, sorted by most recently saved.
   */
  async execute(sqlUserId: string): Promise<SavedPostDocument[]> {
    const savedPosts = await this.savedPostModel
      .find({ sql_user_id: sqlUserId })
      .sort({ saved_at: -1 })
      .exec();

    this.logger.log(
      `Found ${savedPosts.length} saved posts for user ${sqlUserId}`,
    );
    return savedPosts;
  }
}
