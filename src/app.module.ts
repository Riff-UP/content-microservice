import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PostsModule, EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
