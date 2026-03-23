import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventReview, EventReviewDocument } from '../schemas/event-reviews.schema';

type EventRatingAverageResult = {
  eventId: string;
  averageRating: number;
  totalRatings: number;
};

@Injectable()
export class GetEventRatingAverageService {
  private readonly logger = new Logger(GetEventRatingAverageService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  /**
   * Returns rating average and rating count for a specific event.
   */
  async execute(eventId: string): Promise<EventRatingAverageResult> {
    const aggregation = await this.eventReviewModel
      .aggregate<{ totalRatings: number; averageRating: number }>([
        { $match: { event_id: eventId } },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ])
      .exec();

    const result = aggregation[0];
    const totalRatings = result?.totalRatings ?? 0;
    const averageRating = Number((result?.averageRating ?? 0).toFixed(2));

    this.logger.log(
      `Computed average rating for event ${eventId}: ${averageRating} (${totalRatings} ratings)`,
    );

    return {
      eventId,
      averageRating,
      totalRatings,
    };
  }
}