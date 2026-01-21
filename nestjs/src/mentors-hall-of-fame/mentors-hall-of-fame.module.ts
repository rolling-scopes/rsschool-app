import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from '@entities/feedback';
import { User } from '@entities/user';
import { MentorsHallOfFameController } from './mentors-hall-of-fame.controller';
import { MentorsHallOfFameService } from './mentors-hall-of-fame.service';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, User])],
  controllers: [MentorsHallOfFameController],
  providers: [MentorsHallOfFameService],
  exports: [MentorsHallOfFameService],
})
export class MentorsHallOfFameModule {}
