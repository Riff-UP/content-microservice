import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherService } from '../../common/publisher.service';
import { Event, EventDocument } from '../schemas/event.schema';
import { UpdateEventDto } from '../dto/update-event.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';
import { EventReview, EventReviewDocument } from '../../event-reviews/schemas/event-reviews.schema'; 

@Injectable()
export class UpdateEventService {
  private readonly logger = new Logger(UpdateEventService.name);

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,

    @InjectModel(EventReview.name) 
    private readonly eventReviewModel: Model<EventReviewDocument>,
    
    private readonly publisher: PublisherService,
  ) {}

  /**
   * Update an event and emit a notification to followers via RMQ.
   * Throws NOT_FOUND if the event doesn't exist.
   */
  async execute(id: string, dto: UpdateEventDto): Promise<EventDocument> {
    const existing = await this.eventModel.findById(id).exec();
    if (!existing) {
      RpcExceptionHelper.notFound('Event', id);
    }

    const updated = await this.eventModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();

    // 👇 3. LA MAGIA DEL TIEMPO: Limpieza de reseñas prematuras
    if (dto.event_date) {
      const newEventDate = new Date(dto.event_date);
      const now = new Date();

      // Si la nueva fecha es en el futuro (aún no ha pasado)...
      if (newEventDate > now) {
        // Borramos todas las reseñas asociadas a este evento
        const deletedReviews = await this.eventReviewModel.deleteMany({ event_id: id }).exec();
        
        if (deletedReviews.deletedCount > 0) {
          this.logger.log(
            `⚠️ Time-travel detected: Removed ${deletedReviews.deletedCount} premature reviews for event ${id}`
          );
        }
      }
    }

    await this.publisher.publish('event.updated', {
      type: 'event_update',
      message: `Event updated: ${updated.title}`,
      userId: updated.sql_user_id,
      eventId: id,
    });

    this.logger.log(`Event updated and emitted: ${id}`);
    return updated;
  }
}