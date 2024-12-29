import { Task, TaskType } from '@entities/task';
import { ApiProperty } from '@nestjs/swagger';
import { uniqBy } from 'lodash';
import { IdNameDto } from 'src/core/dto';
import { UsedCourseDto } from 'src/courses/dto/used-course.dto';

class QuestionDto {
  @ApiProperty()
  question: string;

  @ApiProperty()
  multiple: boolean;

  @ApiProperty({ type: [String] })
  answers: string[];

  @ApiProperty({ required: false })
  questionImage?: string;

  @ApiProperty({ required: false })
  answersType?: string;
}

class PublicAttributesDto {
  @ApiProperty()
  maxAttemptsNumber: number;

  @ApiProperty()
  numberOfQuestions: number;

  @ApiProperty()
  strictAttemptsMode: boolean;

  @ApiProperty()
  tresholdPercentage: number;

  @ApiProperty({ type: [QuestionDto] })
  questions: QuestionDto[];
}

class AutoTestAttributesDto {
  @ApiProperty({ type: PublicAttributesDto })
  public: PublicAttributesDto;

  @ApiProperty({ type: 'array', items: { type: 'array', items: { type: 'number' } } })
  answers: number[][];
}

export class AutoTestTaskDto {
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
      ? uniqBy(
          task.courseTasks
            .filter(task => !task.disabled)
            .map(({ course }) => new UsedCourseDto({ name: course.name, isActive: !course.completed })),
          course => course.name,
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
    this.attributes = task.attributes as AutoTestAttributesDto;
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

  @ApiProperty({ type: AutoTestAttributesDto })
  public attributes: AutoTestAttributesDto;

  @ApiProperty({ type: [UsedCourseDto] })
  public courses: UsedCourseDto[];
}
