import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherService } from '../../common/publisher.service';
import { Event, EventDocument } from '../schemas/event.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemoveEventService {
  private readonly logger = new Logger(RemoveEventService.name);

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly publisher: PublisherService,
  ) {}

  /**
   * Delete an event and emit a cancellation notification via RMQ.
   * Throws NOT_FOUND if the event doesn't exist.
   */
  async execute(id: string): Promise<EventDocument> {
    const existing = await this.eventModel.findById(id).exec();
    if (!existing) {
      RpcExceptionHelper.notFound('Event', id);
    }

    const removed = await this.eventModel.findByIdAndDelete(id).exec();

    await this.publisher.publish('event.cancelled', {
      type: 'event_cancelled',
      message: `Event cancelled: ${removed.title}`,
      userId: removed.sql_user_id,
      eventId: id,
    });

    this.logger.log(`Event removed and cancellation emitted: ${id}`);
    return removed;
  }
}
