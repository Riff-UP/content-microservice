import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EventAttendance,
  EventAttendanceDocument,
} from '../schemas/event-attendance.schema';

type EventAttendanceTotalResult = {
  eventId: string;
  totalAttendees: number;
};

@Injectable()
export class GetEventAttendanceTotalService {
  private readonly logger = new Logger(GetEventAttendanceTotalService.name);

  constructor(
    @InjectModel(EventAttendance.name)
    private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  /**
   * Returns total confirmed attendees for a specific event.
   */
  async execute(eventId: string): Promise<EventAttendanceTotalResult> {
    const totalAttendees = await this.attendanceModel.countDocuments({
      event_id: eventId,
      status: 'confirmed',
    });

    this.logger.log(
      `Computed total attendees for event ${eventId}: ${totalAttendees}`,
    );

    return {
      eventId,
      totalAttendees,
    };
  }
}