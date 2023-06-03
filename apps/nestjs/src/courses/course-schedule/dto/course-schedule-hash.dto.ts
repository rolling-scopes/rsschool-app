import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CourseScheduleTokenDto {
  @ApiProperty()
  @IsString()
  public token: string;
}
