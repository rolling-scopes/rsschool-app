import { TaskType } from '@entities/task';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  attributes: Record<string, any>;

  @IsString()
  @ApiProperty()
  descriptionUrl: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  description: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  githubRepoName: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  sourceGithubRepoUrl: string;

  @IsNumber()
  @ApiProperty()
  disciplineId: number;

  @IsBoolean()
  @ApiProperty()
  githubPrRequired: boolean;

  @IsNotEmpty()
  @IsEnum(TaskType)
  @ApiProperty()
  type: TaskType;

  @IsArray()
  @ApiProperty()
  @IsOptional()
  skills: string[];

  @IsArray()
  @ApiProperty()
  @IsOptional()
  tags: string[];
}
