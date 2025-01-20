import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { SolutionItem } from '../mentors.service';

export enum SolutionItemStatus {
  InReview = 'in-review',
  Done = 'done',
  RandomTask = 'random-task',
}

@ApiResponse({})
export class MentorDashboardDto {
  constructor(item: SolutionItem) {
    this.studentName = item.person.name;
    this.studentGithubId = item.person.githubId;
    this.taskName = item.taskName;
    this.taskDescriptionUrl = item.taskDescriptionUrl;
    this.courseTaskId = item.courseTaskId;
    this.maxScore = item.maxScore;
    this.resultScore = item.resultScore ?? null;
    this.solutionUrl = item.solutionUrl;
    this.status = item.status;
    this.endDate = item.endDate;
  }

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  taskName: string;

  @ApiProperty()
  taskDescriptionUrl: string;

  @ApiProperty()
  courseTaskId: number;

  @ApiProperty()
  maxScore: number;

  @ApiProperty({ nullable: true, type: Number })
  resultScore: number | null;

  @ApiProperty({ type: String })
  solutionUrl: string;

  @ApiProperty({ enum: SolutionItemStatus, type: SolutionItemStatus, enumName: 'SolutionItemStatusEnum' })
  public status: SolutionItemStatus;

  @ApiProperty({ type: String })
  endDate: string;
}
