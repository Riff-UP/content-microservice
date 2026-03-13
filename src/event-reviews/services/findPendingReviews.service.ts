import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventReview, EventReviewDocument } from '../schemas/event-reviews.schema';
import { Event, EventDocument } from '../../events/schemas/event.schema';
import { EventAttendance, EventAttendanceDocument } from '../../event-attendance/schemas/event-attendance.schema';

@Injectable()
export class FindPendingReviewsService {
  private readonly logger = new Logger(FindPendingReviewsService.name);

  constructor(
    @InjectModel(EventReview.name) private readonly reviewModel: Model<EventReviewDocument>,
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(EventAttendance.name) private readonly attendanceModel: Model<EventAttendanceDocument>,
  ) {}

  async execute(userId: string) {
    // Buscar a qué eventos ha confirmado asistencia el usuario
    const attendances = await this.attendanceModel.find({ sql_user_id: userId }).exec();
    const attendedEventIds = attendances.map(a => a.event_id);

    if (attendedEventIds.length === 0) return [];

    // Buscar las reseñas que YA hizo el usuario
    const existingReviews = await this.reviewModel.find({ sql_user_id: userId }).exec();
    const reviewedEventIds = existingReviews.map(r => r.event_id);

    // Filtrar los eventos a los que asistió pero AÚN NO ha reseñado
    const pendingEventIds = attendedEventIds.filter(id => !reviewedEventIds.includes(id));

    if (pendingEventIds.length === 0) return [];

    // Buscar los detalles de esos eventos y verificar que la fecha ya haya pasado
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const pendingEvents = await this.eventModel.find({
      _id: { $in: pendingEventIds },
      event_date: { $lt: twentyFourHoursAgo } // El evento debió ocurrir hace MÁS de 24 horas
    }).exec();

    this.logger.log(`Found ${pendingEvents.length} pending reviews for user ${userId}`);
    return pendingEvents;
  }
}