import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePromptDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  type?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  text?: string;
}
