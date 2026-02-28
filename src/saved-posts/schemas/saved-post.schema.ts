import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SavedPostDocument = HydratedDocument<SavedPost>;

@Schema({ timestamps: { createdAt: 'saved`_at', updatedAt: false } })
export class SavedPost {
  @Prop({ required: true })
  post_id!: string;

  @Prop({ required: true })
  sql_user_id!: string;
}
export const SavedPostSchema = SchemaFactory.createForClass(SavedPost);
