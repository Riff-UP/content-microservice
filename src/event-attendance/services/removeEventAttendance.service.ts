import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventAttendance, EventAttendanceDocument } from '../schemas/event-attendance.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';

@Injectable()
export class RemoveEventAttendanceService {
  private readonly logger = new Logger(RemoveEventAttendanceService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  async execute(id: string, requesterId: string): Promise<EventAttendanceDocument> {
    const existing = await this.attendanceModel.findById(id).exec();
    if (!existing) {
      RpcExceptionHelper.notFound('EventAttendance', id);
    }

    // ── OWNERSHIP CHECK
    if (existing.sql_user_id !== requesterId) {
      RpcExceptionHelper.forbidden('No tienes permiso para eliminar esta asistencia');
    }

    const removed = await this.attendanceModel.findByIdAndDelete(id).exec();
    this.logger.log(`Attendance removed: ${id}`);
    return removed;
  }
}