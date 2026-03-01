import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PostReaction,
  PostReactionDocument,
} from '../schemas/post-reactions.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemovePostReactionService {
  private readonly logger = new Logger(RemovePostReactionService.name);

  constructor(
    @InjectModel(PostReaction.name)
    private readonly postReactionModel: Model<PostReactionDocument>,
  ) {}

  /**
   * Remove a reaction by its _id.
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(id: string): Promise<PostReactionDocument> {
    const reaction = await this.postReactionModel.findByIdAndDelete(id).exec();

    if (!reaction) {
      RpcExceptionHelper.notFound('PostReaction', id);
    }

    this.logger.log(`Reaction removed: ${id}`);
    return reaction!;
  }
}
