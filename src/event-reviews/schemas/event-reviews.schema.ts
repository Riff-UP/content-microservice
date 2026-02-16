import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type EventReviewDocument = HydratedDocument<EventReview>

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false}  })
export class EventReview {
    @Prop({ required: true })
    event_id!: string

    @Prop({ required: true })
    sql_user_id!: string

    @Prop({ required: true })
    rating!: number;
}
export const EventReviewSchema = SchemaFactory.createForClass(EventReview)