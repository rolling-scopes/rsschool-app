import { ApiProperty } from '@nestjs/swagger';
import { Prompt } from '@entities/prompt';

export class PromptDto {
  constructor(alert: Prompt) {
    this.id = alert.id;
    this.type = alert.type;
    this.text = alert.text;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  text: string;
}
