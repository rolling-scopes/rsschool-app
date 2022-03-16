import { UserGroup } from '@entities/userGroup';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class UserDto {
  constructor(user: UserDto) {
    this.id = user.id;
    this.name = user.name;
    this.githubId = user.githubId;
  }

  @ApiProperty()
  @IsNumber()
  public id: number;

  @ApiProperty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsString()
  public githubId: string;
}

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

  @ApiProperty()
  @IsArray()
  roles: string[];
}
