import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventReview,
  EventReviewDocument,
} from '../schemas/event-reviews.schema';

@Injectable()
export class FindReviewsByEventService {
  private readonly logger = new Logger(FindReviewsByEventService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  /**
   * Returns all reviews for a specific event, sorted by newest first.
   */
  async execute(eventId: string): Promise<EventReviewDocument[]> {
    const reviews = await this.eventReviewModel
      .find({ event_id: eventId })
      .sort({ created_at: -1 })
      .exec();

    this.logger.log(`Found ${reviews.length} reviews for event ${eventId}`);
    return reviews;
  }
}
