import { Module } from '@nestjs/common';
import { PostReactionsService } from './post-reactions.service';
import { PostReactionsController } from './post-reactions.controller';

@Module({
  controllers: [PostReactionsController],
  providers: [PostReactionsService],
})
export class PostReactionsModule {}
