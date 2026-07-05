import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateStudentStatusDto {
  @ApiProperty({ enum: ['expelled', 'active', 'self-study'] })
  @IsIn(['expelled', 'active', 'self-study'])
  status: 'expelled' | 'active' | 'self-study';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}

export class SelfStudentStatusDto {
  @ApiProperty({ enum: ['self-study'] })
  @IsIn(['self-study'])
  status: 'self-study';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
