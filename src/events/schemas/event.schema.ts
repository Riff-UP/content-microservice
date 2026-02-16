import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type EventDocument = HydratedDocument<Event>

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false}  })
export class Event {
    @Prop({ required: true })
    sql_user_id!: string

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ required: true })
    event_date!: Date;

    @Prop({ required: true })
    location!: string;
}
export const EventSchema = SchemaFactory.createForClass(Event);