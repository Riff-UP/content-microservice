import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemovePostService {
  private readonly logger = new Logger(RemovePostService.name);

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Delete a post by its Mongo _id.
   * Throws NOT_FOUND via RPC if it doesn't exist.
   */
  async execute(id: string): Promise<PostDocument> {
    const post = await this.postModel.findByIdAndDelete(id).exec();

    if (!post) {
      RpcExceptionHelper.notFound('Post', id);
    }

    this.logger.log(`Post removed: ${id}`);
    return post!;
  }
}
