import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class SaveTaskSolutionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
