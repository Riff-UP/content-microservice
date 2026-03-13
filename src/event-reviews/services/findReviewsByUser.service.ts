import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventReview,
  EventReviewDocument,
} from '../schemas/event-reviews.schema';

@Injectable()
export class FindReviewsByUserService {
  private readonly logger = new Logger(FindReviewsByUserService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly reviewModel: Model<EventReviewDocument>,
  ) {}

  // El gateway envía { userId } — que en el schema se almacena como sql_user_id
  async execute(userId: string): Promise<EventReviewDocument[]> {
    const records = await this.reviewModel
      .find({ sql_user_id: userId })
      .sort({ created_at: -1 })
      .exec();

    this.logger.log(`Found ${records.length} reviews for user ${userId}`);
    return records;
  }
}