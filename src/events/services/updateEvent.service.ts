import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Event, EventDocument } from '../schemas/event.schema';
import { UpdateEventDto } from '../dto/update-event.dto';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';
import { envs } from '../../config/envs';

@Injectable()
export class UpdateEventService {
  private readonly logger = new Logger(UpdateEventService.name);
  private readonly client: ClientProxy;

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbitUrl],
        queue: 'riff_queue',
        queueOptions: { durable: true },
      },
    });
  }

  /**
   * Update an event and emit a notification to followers via RMQ.
   * Throws NOT_FOUND if the event doesn't exist.
   */
  async execute(id: string, dto: UpdateEventDto): Promise<EventDocument> {
    const existing = await this.eventModel.findById(id).exec();
    if (!existing) {
      RpcExceptionHelper.notFound('Event', id);
    }

    const { followers, ...eventData } = dto;

    const updated = await this.eventModel
      .findByIdAndUpdate(id, eventData, { new: true })
      .exec();

    this.client.emit('event.updated', {
      artistId: updated!.sql_user_id,
      eventTitle: updated!.title,
      followers: followers ?? [],
    });

    this.logger.log(`Event updated and emitted: ${id}`);
    return updated!;
  }
}
