import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class HeroesRadarQueryDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  courseId?: number;
}
