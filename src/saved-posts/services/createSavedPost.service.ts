import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedPost, SavedPostDocument } from '../schemas/saved-post.schema';
import { CreateSavedPostDto } from '../dto/create-saved-post.dto';

@Injectable()
export class CreateSavedPostService {
  private readonly logger = new Logger(CreateSavedPostService.name);

  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPostDocument>,
  ) {}

  /**
   * Save a post for a user.
   * Idempotent: if already saved, returns the existing saved post.
   */
  async execute(dto: CreateSavedPostDto): Promise<SavedPostDocument> {
    this.logger.debug(
      `Attempting to save post ${dto.post_id} for user ${dto.sql_user_id}`,
    );

    const existing = await this.savedPostModel
      .findOne({ post_id: dto.post_id, sql_user_id: dto.sql_user_id })
      .exec();

    if (existing) {
      this.logger.log(
        `ℹ️ Post ${dto.post_id} already saved by user ${dto.sql_user_id}, returning existing`,
      );
      return existing;
    }

    const savedPost = await this.savedPostModel.create(dto);
    this.logger.log(
      `✅ Post ${dto.post_id} saved by user ${dto.sql_user_id}`,
    );
    return savedPost;
  }
}
