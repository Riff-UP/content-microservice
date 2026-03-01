import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventReview,
  EventReviewDocument,
} from '../schemas/event-reviews.schema';
import { UpdateEventReviewDto } from '../dto/update-event-review.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class UpdateEventReviewService {
  private readonly logger = new Logger(UpdateEventReviewService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  /**
   * Update a review (e.g. change rating).
   * Throws NOT_FOUND if the review doesn't exist.
   */
  async execute(
    id: string,
    dto: UpdateEventReviewDto,
  ): Promise<EventReviewDocument> {
    const updated = await this.eventReviewModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      RpcExceptionHelper.notFound('EventReview', id);
    }

    this.logger.log(`Review updated: ${id}`);
    return updated!;
  }
}
