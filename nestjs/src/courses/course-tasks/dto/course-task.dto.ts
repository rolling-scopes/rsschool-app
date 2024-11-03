import { CourseTask, Checker, CrossCheckStatus, CourseTaskValidation } from '@entities/courseTask';
import { TaskType } from '@entities/task';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PersonDto } from 'src/core/dto';
import { TaskSolutionDto } from 'src/courses/task-solutions/dto';

class Validations {
  @ApiProperty()
  [CourseTaskValidation.githubIdInUrl]: boolean;
  @ApiProperty()
  [CourseTaskValidation.githubPrInUrl]: boolean;
}

@ApiResponse({})
export class CourseTaskDto {
  constructor(courseTask: CourseTask) {
    this.id = courseTask.id;
    this.taskId = courseTask.taskId;
    this.type = courseTask.type;
    this.name = courseTask.task.name;
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
    this.taskSolutions = courseTask.taskSolutions?.map(taskSolution => new TaskSolutionDto(taskSolution)) ?? null;
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
  @ApiProperty({ enum: TaskType })
  type: string;

  @IsNotEmpty()
  @ApiProperty()
  name: string;

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

  @ApiProperty({ nullable: true })
  taskSolutions: TaskSolutionDto[] | null;

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
