import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { UpdatePostDto } from '../dto/update-post.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class UpdatePostService {
  private readonly logger = new Logger(UpdatePostService.name);

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  /**
   * Update a post by its Mongo _id.
   * Throws NOT_FOUND via RPC if it doesn't exist.
   */
  async execute(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDocument> {
    const post = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .exec();

    if (!post) {
      RpcExceptionHelper.notFound('Post', id);
    }

    this.logger.log(`Post updated: ${id}`);
    return post!;
  }
}
