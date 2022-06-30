import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { typeEnum } from './course-task.dto';

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

  @ApiProperty()
  @IsNotEmpty()
  checker: string;

  @ApiProperty({ required: false })
  @IsOptional()
  special?: string;

  @ApiProperty()
  @IsNotEmpty()
  studentStartDate: string;

  @ApiProperty()
  @IsNotEmpty()
  studentEndDate: string;

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
  @ApiProperty({ enum: typeEnum })
  type?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  duration?: number;
}
