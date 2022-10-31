import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CourseTask, Task, TaskResult, TaskSolution } from '../../../../../server/src/models';
import { StudentDto } from '../../students/dto';

@ApiResponse({})
export class MentorDashboardDto {
  constructor(
    student: StudentDto,
    task: Task,
    courseTask: CourseTask,
    taskResult?: TaskResult,
    taskSolution?: TaskSolution,
  ) {
    this.studentName = student.name;
    this.studentGithubId = student.githubId;
    this.taskName = task.name;
    this.taskDescriptionUrl = task.descriptionUrl;
    this.courseTaskId = courseTask.id;
    this.maxScore = courseTask.maxScore;
    this.resultScore = taskResult?.score ?? null;
    this.solutionUrl = taskSolution?.url ?? null;
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

  @ApiProperty({ nullable: true, type: String })
  solutionUrl: string | null;
}
