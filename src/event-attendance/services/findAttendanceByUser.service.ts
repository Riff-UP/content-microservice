import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventAttendance,
  EventAttendanceDocument,
} from '../schemas/event-attendance.schema';

@Injectable()
export class FindAttendanceByUserService {
  private readonly logger = new Logger(FindAttendanceByUserService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  async execute(sqlUserId: string): Promise<EventAttendanceDocument[]> {
    const records = await this.attendanceModel
      .find({ sql_user_id: sqlUserId, status: { $ne: 'cancelled' } })
      .sort({ created_at: -1 })
      .exec();

    this.logger.log(
      `Found ${records.length} attendance records for user ${sqlUserId}`,
    );
    return records;
  }
}