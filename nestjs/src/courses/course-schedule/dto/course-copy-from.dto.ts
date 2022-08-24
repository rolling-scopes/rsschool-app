import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CourseCopyFromDto {
  @ApiProperty()
  @IsNumber()
  copyFromCourseId: number;
}
