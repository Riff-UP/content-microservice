import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventAttendance,
  EventAttendanceDocument,
} from '../schemas/event-attendance.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class FindOneEventAttendanceService {
  private readonly logger = new Logger(FindOneEventAttendanceService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  /**
   * Find a single attendance record by its _id.
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(id: string): Promise<EventAttendanceDocument> {
    const record = await this.attendanceModel.findById(id).exec();
    if (!record) {
      RpcExceptionHelper.notFound('EventAttendance', id);
    }
    this.logger.log(`Attendance found: ${id}`);
    return record!;
  }
}
