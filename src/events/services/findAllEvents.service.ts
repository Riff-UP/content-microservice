import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';

@Injectable()
export class FindAllEventsService {
  private readonly logger = new Logger(FindAllEventsService.name);

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  /**
   * Returns all events, sorted by newest first.
   */
  async execute(): Promise<EventDocument[]> {
    const events = await this.eventModel.find().sort({ created_at: -1 }).exec();
    this.logger.log(`Found ${events.length} events`);
    return events;
  }
}
