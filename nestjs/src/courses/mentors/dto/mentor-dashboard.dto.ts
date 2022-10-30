import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CourseTask, Task, TaskResult } from '../../../../../server/src/models';

@ApiResponse({})
export class MentorDashboardDto {
  constructor(task: Task, courseTask: CourseTask, taskResult: TaskResult, student: Student) {
    this.taskId = courseTask.id;
    this.taskName = task.name;
    this.taskDescriptionUrl = task.descriptionUrl;
    this.maxScore = courseTask.maxScore;
    this.resultScore = taskResult.score;
    this.githubPrUrl = taskResult.githubPrUrl;
    this.studentName = student.user.firstName; // TODO: get name
    this.studentGithubId = student.user.githubId;
  }

  @ApiProperty()
  taskId: number;

  @ApiProperty()
  taskName: string;

  @ApiProperty()
  taskDescriptionUrl: string;

  @ApiProperty()
  maxScore: number;

  @ApiProperty()
  resultScore: number;

  @ApiProperty()
  githubPrUrl: string;

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  studentName: string;
}
