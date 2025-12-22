import { CourseRole } from '@entities/session';
import { UserGroup } from '@entities/userGroup';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { UserDto } from 'src/users/dto';

export class UserGroupDto {
  constructor(userGroup: Omit<UserGroup, 'createdDate' | 'updatedDate' | 'users'> & { users: UserDto[] }) {
    this.id = userGroup.id;
    this.name = userGroup.name;
    this.users = userGroup.users;
    this.roles = userGroup.roles;
  }

  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [UserDto] })
  @IsArray()
  users: UserDto[];

  @ApiProperty({ enum: CourseRole, isArray: true })
  @IsArray()
  roles: CourseRole[];
}
