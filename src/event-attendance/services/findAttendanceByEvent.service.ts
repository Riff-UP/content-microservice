import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventAttendance,
  EventAttendanceDocument,
} from '../schemas/event-attendance.schema';

@Injectable()
export class FindAttendanceByEventService {
  private readonly logger = new Logger(FindAttendanceByEventService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  /**
   * Returns all attendance records for a specific event, sorted by newest first.
   */
  async execute(eventId: string): Promise<EventAttendanceDocument[]> {
    const records = await this.attendanceModel
      .find({ event_id: eventId })
      .sort({ created_at: -1 })
      .exec();

    this.logger.log(
      `Found ${records.length} attendance records for event ${eventId}`,
    );
    return records;
  }
}
