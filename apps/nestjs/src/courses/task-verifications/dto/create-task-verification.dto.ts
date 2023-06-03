import { ApiPropertyOptional, ApiResponse } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

@ApiResponse({})
export class CreateTaskVerificationDto {
  constructor(id?: number) {
    this.id = id;
  }

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly id?: number;
}
