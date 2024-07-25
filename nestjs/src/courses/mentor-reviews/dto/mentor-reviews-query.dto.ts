import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MentorReviewsQueryDto {
  @ApiProperty()
  @IsString()
  public current: string;

  @ApiProperty()
  @IsString()
  public pageSize: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public tasks: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public student: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public sortField: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public sortOrder: 'ASC' | 'DESC';
}
