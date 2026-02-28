import { PartialType } from '@nestjs/mapped-types';
import { CreatePostReactionDto } from './create-post-reaction.dto';

export class UpdatePostReactionDto extends PartialType(CreatePostReactionDto) {
  id: string;
}
