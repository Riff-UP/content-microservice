import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    ClientProxy,
    ClientProxyFactory,
    Transport,
} from '@nestjs/microservices';
import { Event, EventDocument } from '../schemas/event.schema';
import { RpcExceptionHelper } from '../../common/helpers/rpc-exception.helper';
import { envs } from '../../config/envs';

@Injectable()
export class RemoveEventService {
    private readonly logger = new Logger(RemoveEventService.name);
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
     * Delete an event and emit a cancellation notification via RMQ.
     * Throws NOT_FOUND if the event doesn't exist.
     */
    async execute(id: string): Promise<EventDocument> {
        const existing = await this.eventModel.findById(id).exec();
        if (!existing) {
            RpcExceptionHelper.notFound('Event', id);
        }

        const removed = await this.eventModel.findByIdAndDelete(id).exec();

        this.client.emit('event.cancelled', {
            type: 'event_cancelled',
            message: `Event cancelled: ${removed!.title}`,
            userId: removed!.sql_user_id,
            eventId: id,
        });

        this.logger.log(`Event removed and cancellation emitted: ${id}`);
        return removed!;
    }
}
