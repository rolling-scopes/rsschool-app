import { Registry } from '@entities/registry';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  courseId: number;

  @ApiProperty({ enum: ['student', 'mentor'] })
  @IsIn(['student', 'mentor'])
  type: 'student' | 'mentor';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxStudentsLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experienceInYears?: string;
}

export class RegistrationResultDto {
  constructor(registry: Registry) {
    this.id = registry.id;
    this.type = registry.type;
    this.status = registry.status;
    this.userId = registry.userId;
    this.courseId = registry.courseId;
    this.attributes = registry.attributes ?? {};
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  courseId: number;

  @ApiProperty({ type: Object })
  attributes: object;
}
