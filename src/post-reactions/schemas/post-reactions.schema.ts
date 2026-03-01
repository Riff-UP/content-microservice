import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostReactionDocument = HydratedDocument<PostReaction>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class PostReaction {
  @Prop({ required: true, index: true })
  sql_user_id!: string;

  @Prop({ required: true, index: true })
  post_id!: string;

  @Prop({ required: true })
  type!: string;
}
export const PostReactionSchema = SchemaFactory.createForClass(PostReaction);

// index created_at to query recent reactions
PostReactionSchema.index({ created_at: -1 });
