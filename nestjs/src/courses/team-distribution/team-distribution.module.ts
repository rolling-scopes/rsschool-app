import { Module } from '@nestjs/common';
import { TeamDistributionService } from './team-distribution.service';
import { TeamDistributionController } from './team-distribution.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamDistribution } from '@entities/teamDistribution';

@Module({
  imports: [TypeOrmModule.forFeature([TeamDistribution])],
  controllers: [TeamDistributionController],
  providers: [TeamDistributionService],
})
export class TeamDistributionModule {}
