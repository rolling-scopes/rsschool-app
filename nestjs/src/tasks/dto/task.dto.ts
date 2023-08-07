import { Task, TaskType } from '@entities/task';
import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto } from 'src/core/dto';

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
    this.courses = task.courseTasks ? task.courseTasks.map(courseTask => new IdNameDto(courseTask.course)) : [];
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

  @ApiProperty({ type: [IdNameDto] })
  public courses: IdNameDto[] | null;
}
