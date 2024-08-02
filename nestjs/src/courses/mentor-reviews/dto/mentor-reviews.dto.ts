import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { PaginationMeta } from 'src/core/paginate';
import { PaginationMetaDto } from 'src/core/paginate/dto/Paginate.dto';
import { TaskSolution } from '@entities/taskSolution';

export class MentorReviewDto {
  constructor(taskSolution: TaskSolution) {
    this.id = taskSolution.id;
    this.taskName = taskSolution.courseTask.task.name;
    this.taskId = taskSolution.courseTask.id;
    this.solutionUrl = taskSolution.url;
    this.submittedAt = new Date(taskSolution.createdDate);
    this.checker = this.getChecker(taskSolution);
    this.score = taskSolution.student.taskResults?.at(0)?.score;
    this.maxScore = taskSolution.courseTask.maxScore;
    this.student = taskSolution.student.user.githubId;
    this.studentId = taskSolution.student.id;
    this.reviewedAt = taskSolution.student.taskResults?.at(0)?.updatedDate
      ? new Date(taskSolution.student.taskResults.at(0)!.updatedDate)
      : undefined;
    this.taskDescriptionUrl = taskSolution.courseTask.task.descriptionUrl;
  }

  private getChecker(taskSolution: TaskSolution) {
    return taskSolution.student.taskResults?.at(0)?.score !== undefined
      ? taskSolution.student.taskResults.at(0)?.lastChecker?.githubId
      : taskSolution.student.taskChecker?.at(0)?.mentor.user.githubId ?? taskSolution.student.mentor?.user.githubId;
  }

  @ApiProperty({ description: 'Task solution id' })
  id: number;

  @ApiProperty({ description: 'Course task name' })
  taskName: string;

  @ApiProperty({ description: 'Course task id' })
  taskId: number;

  @ApiProperty({ description: 'Task solution url' })
  solutionUrl: string;

  @ApiProperty({ description: 'Task solution submission date' })
  submittedAt: Date;

  @ApiProperty({ description: 'Checker github id' })
  checker?: string;

  @ApiProperty({ description: 'Task solution score' })
  score?: number;

  @ApiProperty({ description: 'Task max score' })
  maxScore: number;

  @ApiProperty({ description: 'Student github id' })
  student: string;

  @ApiProperty({ description: 'Student id' })
  studentId: number;

  @ApiProperty({ description: 'Task solution review date' })
  reviewedAt?: Date;

  @ApiProperty({ description: 'Task description url' })
  taskDescriptionUrl: string;
}

@ApiResponse({})
export class MentorReviewsDto {
  constructor(data: { items: TaskSolution[]; meta: PaginationMeta }) {
    this.content = data.items.map(review => new MentorReviewDto(review));
    this.pagination = new PaginationMetaDto(data.meta);
  }

  @ApiProperty({ type: [MentorReviewDto] })
  content: MentorReviewDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
