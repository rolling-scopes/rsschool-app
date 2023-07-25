import { ApiProperty } from '@nestjs/swagger';

export class CreatePromptDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  text: string;
}
