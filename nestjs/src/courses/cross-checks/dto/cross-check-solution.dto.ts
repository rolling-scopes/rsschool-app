import { ApiProperty } from '@nestjs/swagger';
import { TaskSolutionComment, TaskSolutionReview } from '@entities/taskSolution';

export class CrossCheckSolutionDto {
  constructor(data: {
    id: number;
    // entity declares `number`, but the column is a timestamp serialized as an ISO string at runtime
    updatedDate: string | number;
    url: string;
    review: TaskSolutionReview[];
    studentId: number;
    comments: TaskSolutionComment[];
  }) {
    this.id = data.id;
    this.updatedDate = data.updatedDate as string;
    this.url = data.url;
    this.review = data.review;
    this.studentId = data.studentId;
    this.comments = data.comments;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty({ type: String })
  public updatedDate: string;

  @ApiProperty()
  public url: string;

  @ApiProperty({ type: Object, isArray: true })
  public review: TaskSolutionReview[];

  @ApiProperty()
  public studentId: number;

  @ApiProperty({ type: Object, isArray: true })
  public comments: TaskSolutionComment[];
}
