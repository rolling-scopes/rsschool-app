import { CourseTask } from '@entities/courseTask';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

const typeEnum = [
  'jstask',
  'kotlintask',
  'objctask',
  'htmltask',
  'ipynb',
  'selfeducation',
  'codewars',
  'test',
  'codejam',
  'interview',
  'stage-interview',
  'cv:html',
  'cv:markdown',
];

@ApiResponse({})
export class CourseTaskDto {
  constructor(courseTask: CourseTask) {
    this.id = courseTask.id;
    this.type = courseTask.type;
    this.name = courseTask.task.name;
    this.studentEndDate = (courseTask.studentEndDate as Date)?.toISOString();
    this.maxScore = courseTask.maxScore;
    this.scoreWeight = courseTask.scoreWeight;
    this.descriptionUrl = courseTask.task.descriptionUrl;
    this.publicAttributes = courseTask.task?.attributes?.['public'] ?? {};
    this.checker = courseTask.checker;

    this.githubRepoName = courseTask.task.githubRepoName;
    this.sourceGithubRepoUrl = courseTask.task.sourceGithubRepoUrl;
    this.taskOwnerId = courseTask.taskOwnerId;
    this.useJury = courseTask.task.useJury;
  }

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @ApiProperty({ enum: typeEnum })
  type: string;

  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty()
  checker: string;

  @ApiProperty()
  githubRepoName: string;

  @ApiProperty()
  sourceGithubRepoUrl: string;

  @ApiProperty()
  studentEndDate: string;

  @ApiProperty()
  descriptionUrl: string;

  @IsNumber()
  @ApiProperty()
  taskOwnerId: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  maxScore: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  scoreWeight: number;

  @ApiProperty()
  publicAttributes: any;

  @ApiProperty()
  useJury: boolean;
}
