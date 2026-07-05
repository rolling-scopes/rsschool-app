import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMentoringAvailabilityDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  mentoring?: boolean;
}
