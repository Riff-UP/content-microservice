import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventReview,
  EventReviewDocument,
} from '../schemas/event-reviews.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class FindOneEventReviewService {
  private readonly logger = new Logger(FindOneEventReviewService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  /**
   * Find a single review by its _id.
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(id: string): Promise<EventReviewDocument> {
    const review = await this.eventReviewModel.findById(id).exec();
    if (!review) {
      RpcExceptionHelper.notFound('EventReview', id);
    }
    this.logger.log(`Review found: ${id}`);
    return review!;
  }
}
