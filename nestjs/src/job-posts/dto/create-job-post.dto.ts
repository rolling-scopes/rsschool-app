import { JobType } from '@entities/job-post';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateJobPostDto {
  @ApiProperty()
  @IsString()
  public description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public url?: string;

  @ApiProperty()
  @IsString()
  public title: string;

  @ApiProperty()
  @IsString()
  public company: string;

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  public jobType: JobType;
}
