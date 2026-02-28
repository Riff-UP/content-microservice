import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostReactionDocument = HydratedDocument<PostReaction>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class PostReaction {
  @Prop({ required: true })
  sql_user_id!: string;

  @Prop({ required: true })
  post_id!: string;
}
export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);
