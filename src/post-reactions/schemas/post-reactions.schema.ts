import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostReactionDocument = HydratedDocument<PostReaction>;

@Schema()
export class PostReaction {
  @Prop({ required: true, index: true })
  sql_user_id!: string;

  @Prop({ required: true, index: true })
  post_id!: string;

  @Prop({ required: true })
  type!: string;
}
export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);
