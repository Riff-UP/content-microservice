import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventReview,
  EventReviewDocument,
} from '../schemas/event-reviews.schema';

@Injectable()
export class FindAllEventReviewsService {
  private readonly logger = new Logger(FindAllEventReviewsService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  /**
   * Returns all reviews, sorted by newest first.
   */
  async execute(): Promise<EventReviewDocument[]> {
    const reviews = await this.eventReviewModel
      .find()
      .sort({ created_at: -1 })
      .exec();

    this.logger.log(`Found ${reviews.length} reviews`);
    return reviews;
  }
}
