import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersEvents } from './users.events';

@Module({
  providers: [UsersService, UsersEvents],
  exports: [UsersService, UsersEvents],
})
export class UsersModule {}
