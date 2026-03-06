import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedPost, SavedPostDocument } from '../schemas/saved-post.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemoveSavedPostByPostAndUserService {
  private readonly logger = new Logger(
    RemoveSavedPostByPostAndUserService.name,
  );

  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPostDocument>,
  ) {}

  /**
   * Remove (unsave) a saved post by post_id and sql_user_id.
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(postId: string, sqlUserId: string): Promise<SavedPostDocument> {
    const savedPost = await this.savedPostModel
      .findOneAndDelete({ post_id: postId, sql_user_id: sqlUserId })
      .exec();

    if (!savedPost) {
      RpcExceptionHelper.notFound(
        'SavedPost',
        `post_id: ${postId}, user: ${sqlUserId}`,
      );
    }

    this.logger.log(`Post ${postId} unsaved by user ${sqlUserId}`);
    return savedPost!;
  }
}

