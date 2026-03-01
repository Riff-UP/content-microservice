import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventAttendance,
  EventAttendanceDocument,
} from '../schemas/event-attendance.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemoveEventAttendanceService {
  private readonly logger = new Logger(RemoveEventAttendanceService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  /**
   * Delete an attendance record by its _id.
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(id: string): Promise<EventAttendanceDocument> {
    const removed = await this.attendanceModel.findByIdAndDelete(id).exec();

    if (!removed) {
      RpcExceptionHelper.notFound('EventAttendance', id);
    }

    this.logger.log(`Attendance removed: ${id}`);
    return removed!;
  }
}
