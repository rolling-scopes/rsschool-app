import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateTaskDistributionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  clean?: boolean;
}
