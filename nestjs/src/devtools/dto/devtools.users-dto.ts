import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DevtoolsUserDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  githubId: string;

  @ApiProperty({ type: Number, isArray: true })
  mentor: number[];

  @ApiProperty({ type: Number, isArray: true })
  student: number[];
}
