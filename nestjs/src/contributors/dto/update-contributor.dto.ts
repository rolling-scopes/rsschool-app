import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateContributorDto {
  @IsNotEmpty()
  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiPropertyOptional()
  userId?: number;
}
