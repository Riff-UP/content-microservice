import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedPost, SavedPostDocument } from '../schemas/saved-post.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemoveSavedPostService {
  private readonly logger = new Logger(RemoveSavedPostService.name);

  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPostDocument>,
  ) {}

  /**
   * Remove (unsave) a saved post by its _id.
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(id: string): Promise<SavedPostDocument> {
    const savedPost = await this.savedPostModel.findByIdAndDelete(id).exec();

    if (!savedPost) {
      RpcExceptionHelper.notFound('SavedPost', id);
    }

    this.logger.log(`Saved post removed: ${id}`);
    return savedPost!;
  }
}
