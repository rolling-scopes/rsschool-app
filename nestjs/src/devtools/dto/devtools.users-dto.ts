import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DevtoolsUserDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  githubId: string;

  @ApiProperty({ type: Number, isArray: true })
  @IsNumber({}, { each: true })
  mentor: number[];

  @ApiProperty({ type: Number, isArray: true })
  @IsNumber({}, { each: true })
  student: number[];
}
