import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherService } from '../../common/publisher.service';
import { Event, EventDocument } from '../schemas/event.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RemoveEventService {
  private readonly logger = new Logger(RemoveEventService.name);
  private readonly frontendBaseUrl =
    process.env.FRONTEND_URL || process.env.FRONTEND_BASE_URL || '';

  private trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
  }

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly publisher: PublisherService,
    private readonly usersService: UsersService,
  ) {}

  async execute(id: string, requesterId: string): Promise<EventDocument> {
    const existing = await this.eventModel.findById(id).exec();
    if (!existing) {
      RpcExceptionHelper.notFound('Event', id);
    }

    // ── OWNERSHIP CHECK ─────────────────────────────────────────────────────
    if (existing.sql_user_id !== requesterId) {
      RpcExceptionHelper.forbidden('No tienes permiso para eliminar este evento');
    }
    // ────────────────────────────────────────────────────────────────────────

    const removed = await this.eventModel.findByIdAndDelete(id).exec();

    const artistRef = await this.usersService.get(removed.sql_user_id);
    const pathBase = removed.eventPathBase || '/events';
    const normalizedPathBase = pathBase.startsWith('/') ? pathBase : `/${pathBase}`;
    const urlBaseFromDoc = removed.eventUrlBase?.trim() || '';
    const urlBaseFromEnv = this.frontendBaseUrl
      ? `${this.trimTrailingSlash(this.frontendBaseUrl)}${normalizedPathBase}`
      : '';
    const eventUrlBase = urlBaseFromDoc || urlBaseFromEnv;
    const eventUrl = eventUrlBase
      ? `${this.trimTrailingSlash(eventUrlBase)}/${id}`
      : `${this.trimTrailingSlash(normalizedPathBase)}/${id}`;

    await this.publisher.publish('event.cancelled', {
      type: 'event_cancelled',
      message: `Event cancelled: ${removed.title}`,
      userId: removed.sql_user_id,
      artistName: artistRef?.name,
      artistSlug: artistRef?.slug,
      artistAvatar: artistRef?.picture,
      eventId: id,
      eventUrl,
      deepLink: eventUrl,
    });

    this.logger.log(`Event removed and cancellation emitted: ${id}`);
    return removed;
  }
}