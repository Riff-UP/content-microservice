import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublisherService } from '../../common/publisher.service';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateEventDto } from '../dto/create-event.dto';
import { UsersService } from '../../users/users.service';

@Injectable()
export class CreateEventService implements OnModuleInit {
  private readonly logger = new Logger(CreateEventService.name);
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
  async onModuleInit() {
    this.logger.log('CreateEventService initialized');
  }
  /**
   * Create an event and emit a notification to followers via RMQ.
   */
  async execute(dto: CreateEventDto): Promise<EventDocument> {
    // Verificar que el usuario esté replicado
    const userRef = await this.usersService.get(dto.sql_user_id);
    if (!userRef) {
      this.logger.warn(`User ${dto.sql_user_id} not replicated yet`);
      throw new UnauthorizedException(
        'User not replicated yet. Authenticate first.',
      );
    }

    const event = await this.eventModel.create(dto);
    const eventId = String(event._id);
    const pathBase = dto.eventPathBase || '/events';
    const normalizedPathBase = pathBase.startsWith('/')
      ? pathBase
      : `/${pathBase}`;
    const urlBaseFromPayload = dto.eventUrlBase?.trim() || '';
    const urlBaseFromEnv = this.frontendBaseUrl
      ? `${this.trimTrailingSlash(this.frontendBaseUrl)}${normalizedPathBase}`
      : '';
    const eventUrlBase = urlBaseFromPayload || urlBaseFromEnv;
    const eventUrl = eventUrlBase
      ? `${this.trimTrailingSlash(eventUrlBase)}/${eventId}`
      : `${this.trimTrailingSlash(normalizedPathBase)}/${eventId}`;

    await this.publisher.publish('event.created', {
      type: 'new_event',
      message: `New event: ${event.title}`,
      userId: event.sql_user_id,
      artistName: dto.artistName || userRef.name,
      artistSlug: dto.artistSlug || userRef.slug,
      artistAvatar: dto.artistAvatar || userRef.picture,
      eventId,
      eventUrl,
      deepLink: eventUrl,
    });

    // Publish event to promote user to ARTIST role (users-ms listens)
    await this.publisher.publish('user.publishedContent', {
      userId: event.sql_user_id,
    });

    this.logger.log(`Event created and emitted: ${String(event._id)}`);
    return event;
  }
}
