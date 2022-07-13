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

  @ApiProperty({ type: [String] })
  @IsArray()
  roles: string[];
}
