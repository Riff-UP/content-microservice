import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SavedPostDocument = HydratedDocument<SavedPost>;

@Schema({
  timestamps: { createdAt: 'saved_at', updatedAt: false },
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret['id'] = (ret['_id'] as Types.ObjectId).toHexString();
      delete ret['_id'];
      delete ret['__v'];
      return ret;
    },
  },
})
export class SavedPost {
  @Prop({ required: true, index: true })
  post_id!: string;

  @Prop({ required: true, index: true })
  sql_user_id!: string;
}
export const SavedPostSchema = SchemaFactory.createForClass(SavedPost);

// index saved_at for queries by recency
SavedPostSchema.index({ saved_at: -1 });
