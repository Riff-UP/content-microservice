import { Module } from '@nestjs/common';
import { PostReactionsService } from './post-reactions.service';
import { PostReactionsController } from './post-reactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostReaction, PostReactionSchema } from './schemas/post-reactions.schema';

@Module({
  controllers: [PostReactionsController],
  providers: [PostReactionsService],
  imports: [
    MongooseModule.forFeature([{ name : PostReaction.name, schema: PostReactionSchema}])
  ]
})
export class PostReactionsModule {}
