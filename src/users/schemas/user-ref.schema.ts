import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserRefDocument = HydratedDocument<UserRef>;

@Schema({ timestamps: true })
export class UserRef {
    @Prop({ required: true, unique: true, index: true })
    user_id!: string;

    @Prop()
    name?: string;

    @Prop()
    email?: string;

    @Prop()
    googleId?: string;

    @Prop()
    picture?: string;

    @Prop()
    role?: string;

    @Prop()
    token?: string;
}

export const UserRefSchema = SchemaFactory.createForClass(UserRef);
