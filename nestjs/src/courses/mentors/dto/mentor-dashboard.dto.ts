import { Student } from '@entities/student';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CourseTask, Task, TaskResult, TaskSolution } from '../../../../../server/src/models';
import { CourseTaskDto } from '../../course-tasks/dto';
import { StudentDto } from '../../students/dto';

@ApiResponse({})
export class MentorDashboardDto extends CourseTaskDto {
  constructor(courseTask: CourseTask, task: Task, taskResult: TaskResult, student: Student) {
    super(courseTask);
    this.taskId = courseTask.id;
    this.name = task.name;
    this.maxScore = courseTask.maxScore;
    this.resultScore = taskResult.score;
    this.studentName = student.user.firstName; // TODO: get name
    this.studentGithubId = student.user.githubId;
  }

  @ApiProperty()
  taskId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  maxScore: number;

  @ApiProperty()
  resultScore: number;

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  studentName: string;
}
