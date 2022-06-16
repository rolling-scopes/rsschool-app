import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CheckScheduleChangesDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  public lastHours?: number;
}
