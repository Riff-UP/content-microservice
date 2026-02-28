import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Event {
  @Prop({ required: true, index: true })
  sql_user_id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, index: true })
  event_date!: Date;

  @Prop({ required: true })
  location!: string;
}
export const EventSchema = SchemaFactory.createForClass(Event);

// index created_at for recent events queries
EventSchema.index({ created_at: -1 });
