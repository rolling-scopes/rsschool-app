import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class HeroesRadarQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  courseId?: number;

  @ApiPropertyOptional()
  @Transform(
    ({ value }: { value: string }) => {
      const newValue = value.toLowerCase();

      return newValue === 'true' || newValue === '1';
    },
    { toClassOnly: true },
  )
  @IsOptional()
  @IsBoolean()
  notActivist?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryName?: string;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  public current: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  public pageSize: number;
}
