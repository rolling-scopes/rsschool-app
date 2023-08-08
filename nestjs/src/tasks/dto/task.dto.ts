import { Task, TaskType } from '@entities/task';
import { ApiProperty } from '@nestjs/swagger';
import { uniq } from 'lodash';
import { IdNameDto } from 'src/core/dto';
import { UsedCourseDto } from 'src/courses/dto/used-course.dto';

export class TaskDto {
  constructor(task: Task) {
    this.id = task.id;
    this.name = task.name;
    this.type = task.type;
    this.descriptionUrl = task.descriptionUrl;
    this.description = task.description;
    this.githubRepoName = task.githubRepoName;
    this.sourceGithubRepoUrl = task.sourceGithubRepoUrl;
    this.discipline = task.discipline ? new IdNameDto(task.discipline) : null;
    this.courses = task.courseTasks
      ? uniq(
          task.courseTasks.map(({ course }) => new UsedCourseDto({ name: course.name, isActive: !course.completed })),
        ).sort((a, b) => {
          if (a.isActive === b.isActive) {
            return a.name.localeCompare(b.name);
          }
          return Number(b.isActive) - Number(a.isActive);
        })
      : [];
    this.githubPrRequired = task.githubPrRequired;
    this.tags = task.tags;
    this.skills = task.skills;
    this.attributes = task.attributes;
    this.createdDate = task.createdDate;
    this.updatedDate = task.updatedDate;
  }

  @ApiProperty({ enum: TaskType })
  public type: TaskType;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public descriptionUrl: string;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public githubRepoName: string;

  @ApiProperty()
  public sourceGithubRepoUrl: string;

  @ApiProperty({ type: IdNameDto })
  public discipline: IdNameDto | null;

  @ApiProperty()
  public githubPrRequired: boolean;

  @ApiProperty()
  public createdDate: string;

  @ApiProperty()
  public updatedDate: string;

  @ApiProperty()
  public tags: string[];

  @ApiProperty()
  public skills: string[];

  @ApiProperty()
  public attributes: Record<string, any>;

  @ApiProperty({ type: [UsedCourseDto] })
  public courses: UsedCourseDto[];
}
