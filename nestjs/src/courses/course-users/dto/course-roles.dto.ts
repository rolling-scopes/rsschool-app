import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CourseRolesDto {
  @IsBoolean()
  @ApiProperty()
  isManager: boolean;

  @IsBoolean()
  @ApiProperty()
  isSupervisor: boolean;

  @IsBoolean()
  @ApiProperty()
  isDementor: boolean;
}
