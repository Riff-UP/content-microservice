import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    ClientProxy,
    ClientProxyFactory,
    Transport,
} from '@nestjs/microservices';
import { Event, EventDocument } from '../schemas/event.schema';
import { CreateEventDto } from '../dto/create-event.dto';
import { envs } from '../../config/envs';

@Injectable()
export class CreateEventService {
    private readonly logger = new Logger(CreateEventService.name);
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
     * Create an event and emit a notification to followers via RMQ.
     */
    async execute(dto: CreateEventDto): Promise<EventDocument> {
        const event = await this.eventModel.create(dto);

        this.client.emit('event.created', {
            type: 'new_event',
            message: `New event: ${event.title}`,
            userId: event.sql_user_id,
            eventId: String(event._id),
        });

        this.logger.log(`Event created and emitted: ${String(event._id)}`);
        return event;
    }
}
