import { CourseRole } from '@entities/session';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserGroupDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  users: number[];

  @ApiProperty({ enum: CourseRole, isArray: true })
  @IsArray()
  roles: CourseRole[];
}
