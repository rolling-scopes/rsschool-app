import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePromptDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  temperature?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  type?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  text?: string;
}
