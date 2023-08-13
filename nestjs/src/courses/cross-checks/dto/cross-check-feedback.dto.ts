import { ApiProperty } from '@nestjs/swagger';
import { CrossCheckMessageDto } from './check-tasks-pairs.dto';
import { Discord } from 'src/profile/dto';
import { CrossCheckSolutionReview } from '../course-cross-checks.service';
import { TaskSolution } from '@entities/taskSolution';
import { CrossCheckCriteriaDataDto } from './cross-check-criteria-data.dto';

export class CrossCheckAuthorDto {
  @ApiProperty({ required: true })
  public id: number;

  @ApiProperty({ required: true })
  public name: string;

  @ApiProperty({ required: true })
  public githubId: string;

  @ApiProperty({ nullable: true, type: Discord })
  discord: Discord | null;
}

export class CrossCheckSolutionReviewDto {
  @ApiProperty({ required: true })
  public id: number;

  @ApiProperty({ required: true })
  public dateTime: number;

  @ApiProperty({ required: true })
  public comment: string;

  @ApiProperty({ required: false, type: [CrossCheckCriteriaDataDto] })
  public criteria?: CrossCheckCriteriaDataDto[];

  @ApiProperty({ nullable: true, type: CrossCheckAuthorDto })
  public author: CrossCheckAuthorDto | null;

  @ApiProperty({ required: true })
  public score: number;

  @ApiProperty({ required: true, type: [CrossCheckMessageDto] })
  public messages: CrossCheckMessageDto[];
}

export class CrossCheckFeedbackDto {
  constructor(crossCheckSolutionReviews: CrossCheckSolutionReview[], taskSolution: TaskSolution | null) {
    this.reviews = crossCheckSolutionReviews;
    this.url = taskSolution?.url;
  }

  @ApiProperty({ required: false })
  public url?: string;

  @ApiProperty({ required: false, type: [CrossCheckSolutionReviewDto] })
  public reviews?: CrossCheckSolutionReviewDto[];
}
