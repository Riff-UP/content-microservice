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
  ): Promise<PaginatedResult<EventDocument>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.eventModel
        .find({ cancelled_at: { $exists: false } })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel
        .countDocuments({ cancelled_at: { $exists: false } })
        .exec(),
    ]);

    this.logger.log(
      `Found ${data.length} events (page ${page}/${Math.ceil(total / limit)})`,
    );
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
