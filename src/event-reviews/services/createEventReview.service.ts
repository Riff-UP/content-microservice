import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventReview,
  EventReviewDocument,
} from '../schemas/event-reviews.schema';
import { CreateEventReviewDto } from '../dto/create-event-review.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class CreateEventReviewService {
  private readonly logger = new Logger(CreateEventReviewService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  /**
   * Create a review for an event.
   * A user can only review the same event once.
   */
  async execute(dto: CreateEventReviewDto): Promise<EventReviewDocument> {
    const existing = await this.eventReviewModel
      .findOne({ event_id: dto.event_id, sql_user_id: dto.sql_user_id })
      .exec();

    if (existing) {
      RpcExceptionHelper.conflict(
        `User ${dto.sql_user_id} already reviewed event ${dto.event_id}`,
      );
    }

    const review = await this.eventReviewModel.create(dto);
    this.logger.log(
      `Review created for event ${dto.event_id} by user ${dto.sql_user_id}`,
    );
    return review;
  }
}
