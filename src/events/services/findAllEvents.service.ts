import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { PaginationDto, PaginatedResult } from '../../common';

@Injectable()
export class FindAllEventsService {
  private readonly logger = new Logger(FindAllEventsService.name);

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  /**
   * Returns paginated events, sorted by newest first.
   */
  async execute(
    pagination?: PaginationDto,
    sqlUserId?: string,
  ): Promise<PaginatedResult<EventDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: any = { cancelled_at: { $exists: false } };
    if (sqlUserId) filter.sql_user_id = sqlUserId;

    const [data, total] = await Promise.all([
      this.eventModel
        .find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }
}
