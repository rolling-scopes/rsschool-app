import { ApiProperty } from '@nestjs/swagger';
import { CrossCheckMessageDto } from './check-tasks-pairs.dto';
import { Discord } from 'src/profile/dto';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { CrossCheckSolutionReview } from '../course-cross-checks.service';
import { TaskSolution } from '@entities/taskSolution';

export type CrossCheckCriteriaType = 'title' | 'subtask' | 'penalty';

export class CrossCheckCriteriaDataDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ enum: ['title', 'subtask', 'penalty'] })
  @IsIn(['title', 'subtask', 'penalty'])
  type: CrossCheckCriteriaType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  point?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  textComment?: string;
}

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
  constructor(crossCheckSolutionReviews: CrossCheckSolutionReview[], taskSolution: TaskSolution) {
    this.reviews = crossCheckSolutionReviews;
    this.url = taskSolution.url;
  }

  @ApiProperty({ required: false })
  public url?: string;

  @ApiProperty({ required: false, type: [CrossCheckSolutionReviewDto] })
  public reviews?: CrossCheckSolutionReviewDto[];
}
