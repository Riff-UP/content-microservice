import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventAttendance,
  EventAttendanceDocument,
} from '../schemas/event-attendance.schema';
import { CreateEventAttendanceDto } from '../dto/create-event-attendance.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class CreateEventAttendanceService {
  private readonly logger = new Logger(CreateEventAttendanceService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  /**
   * Register attendance for an event.
   * A user can only register once per event.
   */
  async execute(
    dto: CreateEventAttendanceDto,
  ): Promise<EventAttendanceDocument> {
    const existing = await this.attendanceModel
      .findOne({ event_id: dto.event_id, sql_user_id: dto.sql_user_id })
      .exec();

    if (existing) {
      RpcExceptionHelper.conflict(
        `User ${dto.sql_user_id} already registered for event ${dto.event_id}`,
      );
    }

    const attendance = await this.attendanceModel.create(dto);
    this.logger.log(
      `Attendance created: user ${dto.sql_user_id} for event ${dto.event_id}`,
    );
    return attendance;
  }
}
