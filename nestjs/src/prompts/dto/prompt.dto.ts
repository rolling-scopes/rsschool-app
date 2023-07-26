import { ApiProperty } from '@nestjs/swagger';
import { Prompt } from '@entities/prompt';

export class PromptDto {
  constructor(prompt: Prompt) {
    this.id = prompt.id;
    this.type = prompt.type;
    this.text = prompt.text;
    this.temperature = prompt.temperature;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  temperature: number;
}
