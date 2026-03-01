import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class FindOneEventService {
  private readonly logger = new Logger(FindOneEventService.name);

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  /**
   * Find a single event by its Mongo _id.
   * Throws NOT_FOUND via RPC if it doesn't exist.
   */
  async execute(id: string): Promise<EventDocument> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      RpcExceptionHelper.notFound('Event', id);
    }
    this.logger.log(`Event found: ${id}`);
    return event!;
  }
}
