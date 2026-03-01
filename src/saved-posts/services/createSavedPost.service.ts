import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedPost, SavedPostDocument } from '../schemas/saved-post.schema';
import { CreateSavedPostDto } from '../dto/create-saved-post.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class CreateSavedPostService {
  private readonly logger = new Logger(CreateSavedPostService.name);

  constructor(
    @InjectModel(SavedPost.name)
    private readonly savedPostModel: Model<SavedPostDocument>,
  ) {}

  /**
   * Save a post for a user.
   * Prevents duplicates: a user can only save the same post once.
   */
  async execute(dto: CreateSavedPostDto): Promise<SavedPostDocument> {
    const existing = await this.savedPostModel
      .findOne({ post_id: dto.post_id, sql_user_id: dto.sql_user_id })
      .exec();

    if (existing) {
      RpcExceptionHelper.conflict(
        `User ${dto.sql_user_id} already saved post ${dto.post_id}`,
      );
    }

    const savedPost = await this.savedPostModel.create(dto);
    this.logger.log(`Post ${dto.post_id} saved by user ${dto.sql_user_id}`);
    return savedPost;
  }
}
