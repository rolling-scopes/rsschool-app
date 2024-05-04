import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class InviteMentorsDto {
  @ApiProperty()
  @IsArray()
  preselectedCourses: string[];

  @ApiProperty()
  @IsBoolean()
  certificate: boolean;

  @ApiProperty()
  @IsBoolean()
  mentor: boolean;

  @ApiProperty()
  @IsString()
  text: string;
}
