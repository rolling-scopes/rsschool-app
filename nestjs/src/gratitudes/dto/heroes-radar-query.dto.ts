import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class HeroesRadarQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  courseId?: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  public current: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  public pageSize: number;
}
