import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventReviewDocument = HydratedDocument<EventReview>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class EventReview {
  @Prop({ required: true, index: true })
  event_id!: string;

  @Prop({ required: true, index: true })
  sql_user_id!: string;

  @Prop({ required: true })
  rating!: number;
}
export const EventReviewSchema = SchemaFactory.createForClass(EventReview);

// index created_at for recent reviews
EventReviewSchema.index({ created_at: -1 });
