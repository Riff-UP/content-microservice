import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SavedPostDocument = HydratedDocument<SavedPost>;

@Schema({ timestamps: { createdAt: 'saved_at', updatedAt: false } })
export class SavedPost {
  @Prop({ required: true, index: true })
  post_id!: string;

  @Prop({ required: true, index: true })
  sql_user_id!: string;
}
export const SavedPostSchema = SchemaFactory.createForClass(SavedPost);

// index saved_at for queries by recency
SavedPostSchema.index({ saved_at: -1 });
