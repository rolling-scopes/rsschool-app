import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CourseRolesDto } from './course-roles.dto';

export class PutUsersDto extends CourseRolesDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  userId: number;
}
