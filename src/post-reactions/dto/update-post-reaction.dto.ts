import { PartialType } from '@nestjs/mapped-types';
import { CreatePostReactionDto } from './create-post-reaction.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePostReactionDto extends PartialType(CreatePostReactionDto) {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
