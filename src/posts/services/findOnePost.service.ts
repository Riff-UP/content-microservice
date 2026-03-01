import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class FindOnePostService {
  private readonly logger = new Logger(FindOnePostService.name);

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Find a single post by its Mongo _id.
   * Throws NOT_FOUND via RPC if it doesn't exist.
   */
  async execute(id: string): Promise<PostDocument> {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      RpcExceptionHelper.notFound('Post', id);
    }
    this.logger.log(`Post found: ${id}`);
    return post!;
  }
}
