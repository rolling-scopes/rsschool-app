import { ApiProperty } from '@nestjs/swagger';

export class TaskPerformanceStatsDto {
  constructor(stats: {
    totalAchievement: number;
    minimalAchievement: number;
    lowAchievement: number;
    moderateAchievement: number;
    highAchievement: number;
    exceptionalAchievement: number;
    perfectScores: number;
  }) {
    this.totalAchievement = stats.totalAchievement;
    this.minimalAchievement = stats.minimalAchievement;
    this.lowAchievement = stats.lowAchievement;
    this.moderateAchievement = stats.moderateAchievement;
    this.highAchievement = stats.highAchievement;
    this.exceptionalAchievement = stats.exceptionalAchievement;
    this.perfectScores = stats.perfectScores;
  }

  @ApiProperty({ description: 'Total number of students who submitted the task' })
  totalAchievement: number;

  @ApiProperty({ description: 'Number of students scoring between 1% and 20% of the maximum points' })
  minimalAchievement: number;

  @ApiProperty({ description: 'Number of students scoring between 21% and 50% of the maximum points' })
  lowAchievement: number;

  @ApiProperty({ description: 'Number of students scoring between 51% and 70% of the maximum points' })
  moderateAchievement: number;

  @ApiProperty({ description: 'Number of students scoring between 71% and 90% of the maximum points' })
  highAchievement: number;

  @ApiProperty({ description: 'Number of students scoring between 91% and 99% of the maximum points' })
  exceptionalAchievement: number;

  @ApiProperty({ description: 'Number of students achieving a perfect score of 100%' })
  perfectScores: number;
}
