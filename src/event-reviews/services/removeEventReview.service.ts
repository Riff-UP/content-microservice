import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventReview, EventReviewDocument } from '../schemas/event-reviews.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemoveEventReviewService {
  private readonly logger = new Logger(RemoveEventReviewService.name);

  constructor(
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
  ) {}

  async execute(id: string, requesterId: string): Promise<EventReviewDocument> {
    const existing = await this.eventReviewModel.findById(id).exec();
    if (!existing) {
      RpcExceptionHelper.notFound('EventReview', id);
    }

    // ── OWNERSHIP CHECK
    if (existing.sql_user_id !== requesterId) {
      RpcExceptionHelper.forbidden('No tienes permiso para eliminar esta reseña');
    }

    const removed = await this.eventReviewModel.findByIdAndDelete(id).exec();
    this.logger.log(`Review removed: ${id}`);
    return removed;
  }
}