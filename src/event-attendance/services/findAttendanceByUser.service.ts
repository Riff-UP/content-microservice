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

  // El gateway pasa { userId } que es el UUID de MongoDB (campo userId en el schema)
  async execute(userId: string): Promise<EventAttendanceDocument[]> {
    const records = await this.attendanceModel
      .find({ userId, status: { $ne: 'cancelled' } })
      .sort({ created_at: -1 })
      .exec();

    this.logger.log(
      `Found ${records.length} attendance records for user ${userId}`,
    );
    return records;
  }
}