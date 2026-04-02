import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherService } from '../../common/publisher.service';
import { Event, EventDocument } from '../schemas/event.schema';
import { UpdateEventDto } from '../dto/update-event.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';
import { EventReview, EventReviewDocument } from '../../event-reviews/schemas/event-reviews.schema';
import { UsersService } from '../../users/users.service';

@Injectable()
export class UpdateEventService {
  private readonly logger = new Logger(UpdateEventService.name);
  private readonly frontendBaseUrl =
    process.env.FRONTEND_URL || process.env.FRONTEND_BASE_URL || '';

  private trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
  }

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectModel(EventReview.name)
    private readonly eventReviewModel: Model<EventReviewDocument>,
    private readonly publisher: PublisherService,
    private readonly usersService: UsersService,
  ) {}

  async execute(id: string, dto: UpdateEventDto, requesterId: string): Promise<EventDocument> {
    const existing = await this.eventModel.findById(id).exec();
    if (!existing) {
      RpcExceptionHelper.notFound('Event', id);
    }

    // ── OWNERSHIP CHECK ─────────────────────────────────────────────────────
    if (existing.sql_user_id !== requesterId) {
      RpcExceptionHelper.forbidden('No tienes permiso para modificar este evento');
    }
    // ────────────────────────────────────────────────────────────────────────

    const updated = await this.eventModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();

    if (dto.event_date) {
      const newEventDate = new Date(dto.event_date);
      const now = new Date();
      if (newEventDate > now) {
        const deletedReviews = await this.eventReviewModel
          .deleteMany({ event_id: id })
          .exec();
        if (deletedReviews.deletedCount > 0) {
          this.logger.log(
            `Time-travel detected: Removed ${deletedReviews.deletedCount} premature reviews for event ${id}`,
          );
        }
      }
    }

    const artistRef = await this.usersService.get(updated.sql_user_id);
    const pathBase = String(dto.eventPathBase ?? updated.eventPathBase ?? '/events');
    const normalizedPathBase = pathBase.startsWith('/') ? pathBase : `/${pathBase}`;
    const urlBaseFromPayload = String(dto.eventUrlBase ?? '').trim();
    const urlBaseFromDoc = String(updated.eventUrlBase ?? '').trim();
    const urlBaseFromEnv = this.frontendBaseUrl
      ? `${this.trimTrailingSlash(this.frontendBaseUrl)}${normalizedPathBase}`
      : '';
    const eventUrlBase = urlBaseFromPayload || urlBaseFromDoc || urlBaseFromEnv;
    const eventUrl = eventUrlBase
      ? `${this.trimTrailingSlash(eventUrlBase)}/${id}`
      : `${this.trimTrailingSlash(normalizedPathBase)}/${id}`;

    await this.publisher.publish('event.updated', {
      type: 'event_update',
      message: `Event updated: ${updated.title}`,
      userId: updated.sql_user_id,
      artistName: String(dto.artistName ?? artistRef?.name ?? '').trim() || undefined,
      artistSlug: String(dto.artistSlug ?? artistRef?.slug ?? '').trim() || undefined,
      artistAvatar: String(dto.artistAvatar ?? artistRef?.picture ?? '').trim() || undefined,
      eventId: id,
      eventUrl,
      deepLink: eventUrl,
    });

    this.logger.log(`Event updated and emitted: ${id}`);
    return updated;
  }
}