import { CourseTask, Checker, CrossCheckStatus, CourseTaskValidation } from '@entities/courseTask';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PersonDto } from 'src/core/dto';

export const typeEnum = [
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

class Validations {
  @ApiProperty()
  [CourseTaskValidation.githubIdInUrl]: boolean;
}

@ApiResponse({})
export class CourseTaskDto {
  constructor(courseTask: CourseTask) {
    this.id = courseTask.id;
    this.taskId = courseTask.taskId;
    this.type = courseTask.type;
    this.taskName = courseTask.task.name;
    this.studentStartDate = (courseTask.studentStartDate as Date)?.toISOString();
    this.studentEndDate = (courseTask.studentEndDate as Date)?.toISOString();
    this.maxScore = courseTask.maxScore;
    this.scoreWeight = courseTask.scoreWeight;
    this.descriptionUrl = courseTask.task.descriptionUrl;
    this.checker = courseTask.checker;
    this.crossCheckStatus = courseTask.crossCheckStatus;
    this.crossCheckEndDate = (courseTask.crossCheckEndDate as Date)?.toISOString() ?? null;
    this.pairsCount = courseTask.pairsCount;
    this.submitText = courseTask.submitText;
    this.taskOwner = courseTask.taskOwner ? new PersonDto(courseTask.taskOwner) : null;
    this.validations = courseTask.validations;
  }

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  taskId: number;

  @IsNotEmpty()
  @ApiProperty({ enum: typeEnum })
  type: string;

  @IsNotEmpty()
  @ApiProperty()
  taskName: string;

  @ApiProperty({ enum: Checker })
  checker: Checker;

  @ApiProperty()
  studentStartDate: string;

  @ApiProperty()
  studentEndDate: string;

  @ApiProperty({ nullable: true, type: String })
  crossCheckEndDate: string | null;

  @ApiProperty()
  descriptionUrl: string;

  @ApiProperty({ nullable: true, type: PersonDto })
  taskOwner: PersonDto | null;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  maxScore: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  scoreWeight: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ type: Number, nullable: true })
  pairsCount: number | null;

  @IsNotEmpty()
  @ApiProperty()
  crossCheckStatus: CrossCheckStatus;

  @ApiProperty({ nullable: true, type: String })
  submitText: string | null;

  @ApiProperty({ nullable: true, type: Validations })
  validations: Record<CourseTaskValidation, boolean> | null;
}
