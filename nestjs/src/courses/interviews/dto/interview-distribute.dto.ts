import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class InterviewDistributeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  courseTaskId: number;

  @ApiProperty()
  mentorId: number;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  createdDate: string;

  @ApiProperty()
  updatedDate: Date;
}

export class InterviewDistributeDto {
  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  clean: boolean = false;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  registrationEnabled: boolean = true;
}
