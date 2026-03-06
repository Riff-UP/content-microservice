import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventReview,
  EventReviewDocument,
} from '../schemas/event-reviews.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemoveEventReviewService {
  private readonly logger = new Logger(RemoveEventReviewService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  /**
   * Delete a review by its _id.
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(id: string): Promise<EventReviewDocument> {
    const removed = await this.eventReviewModel.findByIdAndDelete(id).exec();

    if (!removed) {
      RpcExceptionHelper.notFound('EventReview', id);
    }

    this.logger.log(`Review removed: ${id}`);
    return removed!;
  }
}
