import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CourseTask, Task, TaskResult, TaskSolution } from '../../../../../server/src/models';

@ApiResponse({})
export class MentorDashboardDto {
  constructor(
    student: Student,
    task: Task,
    courseTask: CourseTask,
    taskResult?: TaskResult,
    taskSolution?: TaskSolution,
  ) {
    this.studentName = student.user.firstName; // TODO: get name
    this.studentGithubId = student.user.githubId;
    this.taskName = task.name;
    this.taskDescriptionUrl = task.descriptionUrl;
    this.courseTaskId = courseTask.id;
    this.maxScore = courseTask.maxScore;
    this.resultScore = taskResult?.score ?? null;
    this.solutionUrl = taskSolution?.url ?? null;
  }

  @ApiProperty()
  courseTaskId: number;

  @ApiProperty()
  taskName: string;

  @ApiProperty()
  taskDescriptionUrl: string;

  @ApiProperty()
  maxScore: number;

  @ApiProperty({ nullable: true })
  resultScore: number | null;

  @ApiProperty({ nullable: true })
  solutionUrl: string | null;

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  studentName: string;
}
