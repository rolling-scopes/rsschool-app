import { Checker, CourseTaskValidation } from '@entities/courseTask';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { TaskType } from '@entities/task';

export class CreateCourseTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  taskId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxScore?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  scoreWeight?: number;

  @ApiProperty({ enum: Checker, type: Checker })
  @IsNotEmpty()
  checker: Checker;

  @ApiProperty()
  @IsNotEmpty()
  studentStartDate: string;

  @ApiProperty()
  @IsNotEmpty()
  studentEndDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  studentRegistrationStartDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  crossCheckEndDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  taskOwnerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pairsCount?: number;

  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ enum: TaskType })
  type?: string;

  @IsOptional()
  @ApiProperty({ type: String })
  submitText?: string;

  @IsOptional()
  @ApiProperty()
  validations?: Record<CourseTaskValidation, boolean> | null;
}
