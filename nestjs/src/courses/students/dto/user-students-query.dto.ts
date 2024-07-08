import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UserStudentsQueryDto {
  @ApiProperty()
  @IsString()
  public current: string;

  @ApiProperty()
  @IsString()
  public pageSize: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  student?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ongoingCourses?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  previousCourses?: string;
}
