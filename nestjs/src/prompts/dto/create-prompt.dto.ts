import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePromptDto {
  @IsString()
  @ApiProperty()
  type: string;

  @IsString()
  @ApiProperty()
  text: string;
}
