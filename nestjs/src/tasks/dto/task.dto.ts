import { Task, TaskType } from '@entities/task';
import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto } from 'src/core/dto';

export class TaskDto {
  constructor(discipline: Task) {
    this.id = discipline.id;
    this.name = discipline.name;
    this.descriptionUrl = discipline.descriptionUrl;
    this.description = discipline.description;
    this.githubRepoName = discipline.githubRepoName;
    this.sourceGithubRepoUrl = discipline.sourceGithubRepoUrl;
    this.discipline = discipline.discipline ? new IdNameDto(discipline) : null;
    this.githubPrRequired = discipline.githubPrRequired;
    this.tags = discipline.tags;
    this.skills = discipline.skills;
    this.attributes = discipline.attributes;
    this.createdDate = discipline.createdDate;
    this.updatedDate = discipline.updatedDate;
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
}
