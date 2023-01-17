import { CourseTask } from '@entities/courseTask';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { TaskVerification } from '@entities/taskVerification';
import { CourseTaskDetailedDto } from './course-task-detailed.dto';
import { CourseTaskStateEnum, CourseTaskStatusEnum } from '../course-tasks.service';

@ApiResponse({})
export class CourseTaskVerificationsDto extends CourseTaskDetailedDto {
  constructor(courseTask: CourseTask, state: CourseTaskStateEnum, status: CourseTaskStatusEnum) {
    super(courseTask);
    this.publicAttributes = courseTask.task?.attributes?.['public'] ?? {};
    this.githubRepoName = courseTask.task.githubRepoName;
    this.sourceGithubRepoUrl = courseTask.task.sourceGithubRepoUrl;
    this.verifications = courseTask.taskVerifications;
    this.state = state;
    this.status = status;
  }

  @ApiProperty({ type: [TaskVerification], nullable: true })
  verifications: TaskVerification[] | null;

  @ApiProperty({ type: CourseTaskStateEnum })
  state: CourseTaskStateEnum;

  @ApiProperty({ type: CourseTaskStatusEnum })
  status: CourseTaskStatusEnum;
}
