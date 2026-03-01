import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventAttendance,
  EventAttendanceDocument,
} from '../schemas/event-attendance.schema';
import { UpdateEventAttendanceDto } from '../dto/update-event-attendance.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class UpdateEventAttendanceService {
  private readonly logger = new Logger(UpdateEventAttendanceService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  /**
   * Update an attendance record (e.g. change status).
   * Throws NOT_FOUND if it doesn't exist.
   */
  async execute(
    id: string,
    dto: UpdateEventAttendanceDto,
  ): Promise<EventAttendanceDocument> {
    const updated = await this.attendanceModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      RpcExceptionHelper.notFound('EventAttendance', id);
    }

    this.logger.log(`Attendance updated: ${id}`);
    return updated!;
  }
}
