import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedPost, SavedPostDocument } from '../schemas/saved-post.schema';

type PostSavesTotalResult = {
  postId: string;
  totalSaves: number;
};

@Injectable()
export class GetPostSavesTotalService {
  private readonly logger = new Logger(GetPostSavesTotalService.name);

  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPostDocument>,
  ) {}

  async execute(postId: string): Promise<PostSavesTotalResult> {
    const totalSaves = await this.savedPostModel.countDocuments({
      post_id: postId,
    });

    this.logger.log(`Computed total saves for post ${postId}: ${totalSaves}`);

    return {
      postId,
      totalSaves,
    };
  }
}
