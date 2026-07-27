import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { SystemUsersController } from './system-users.controller';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController, SystemUsersController],
  exports: [UsersService],
})
export class UsersModule {}
