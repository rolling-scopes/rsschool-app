import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UsedCourseDto {
  constructor(obj: { name: string; isActive: boolean }) {
    this.isActive = obj.isActive;
    this.name = obj.name;
  }

  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  isActive: boolean;
}
