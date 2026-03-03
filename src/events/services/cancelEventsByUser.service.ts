import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';

@Injectable()
export class CancelEventsByUserService {
  private readonly logger = new Logger(CancelEventsByUserService.name);

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  /**
   * Cancel all events by a specific user (set cancelled_at timestamp).
   */
  async execute(userId: string): Promise<number> {
    const result = await this.eventModel.updateMany(
      { sql_user_id: userId, cancelled_at: { $exists: false } },
      { $set: { cancelled_at: new Date() } },
    );

    this.logger.log(
      `Cancelled ${result.modifiedCount} events for user ${userId}`,
    );
    return result.modifiedCount;
  }
}
