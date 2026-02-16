import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type EventAttendanceDocument = HydratedDocument<EventAttendance>

@Schema({ timestamps: {createdAt: 'created_at', updatedAt: false} })
export class EventAttendance {
    @Prop({ required: true })
    event_id!: string

    @Prop({ required: true })
    sql_user_id!: string
}
export const EventAttendanceSchema = SchemaFactory.createForClass(EventAttendance)