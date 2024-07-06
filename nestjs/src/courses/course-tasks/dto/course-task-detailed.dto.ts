import { CourseTask } from '@entities/courseTask';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { CourseTaskDto } from './course-task.dto';

@ApiResponse({})
export class CourseTaskDetailedDto extends CourseTaskDto {
  constructor(
    courseTask: CourseTask & {
      resultsCount?: number;
      interviewResultsCount?: number;
      stageInterviewResultsCount?: number;
    },
  ) {
    super(courseTask);
    this.publicAttributes = courseTask.task?.attributes?.['public'] ?? {};
    this.githubRepoName = courseTask.task.githubRepoName;
    this.sourceGithubRepoUrl = courseTask.task.sourceGithubRepoUrl;
    this.resultsCount =
      courseTask.resultsCount || courseTask.interviewResultsCount || courseTask.stageInterviewResultsCount || 0;
  }

  @ApiProperty()
  publicAttributes: any;

  @ApiProperty()
  githubRepoName: string;

  @ApiProperty()
  sourceGithubRepoUrl: string;

  @ApiProperty()
  resultsCount: number;
}
