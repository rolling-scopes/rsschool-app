import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskSolutionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  url: string;
}
