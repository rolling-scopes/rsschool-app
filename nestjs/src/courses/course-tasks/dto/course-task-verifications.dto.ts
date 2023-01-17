import { CourseTask } from '@entities/courseTask';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { TaskVerification } from '@entities/taskVerification';
import { CourseTaskDetailedDto } from './course-task-detailed.dto';

@ApiResponse({})
export class CourseTaskVerificationsDto extends CourseTaskDetailedDto {
  constructor(courseTask: CourseTask) {
    super(courseTask);
    this.publicAttributes = courseTask.task?.attributes?.['public'] ?? {};
    this.githubRepoName = courseTask.task.githubRepoName;
    this.sourceGithubRepoUrl = courseTask.task.sourceGithubRepoUrl;
    this.verifications = courseTask.taskVerifications;
  }

  @ApiProperty({ type: [TaskVerification], nullable: true })
  verifications: TaskVerification[] | null;
}
