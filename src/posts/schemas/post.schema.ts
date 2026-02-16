import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PostDocument = HydratedDocument<Post>

@Schema({ timestamps: {createdAt: 'created_at', updatedAt: false} })
export class Post {
    @Prop({ required: true })
    sql_user_id!: string

    @Prop({required: true})
    type!: string

    @Prop({required: true})
    title!: string;

    @Prop({required: true})
    content!: string;

    @Prop({required: true})
    provider!: string;

    @Prop({required: true})
    description!: string;
}
export const PostSchema = SchemaFactory.createForClass(Post);