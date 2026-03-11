import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class HeroesRadarQueryDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  public current: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  public pageSize: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Transform(
    ({ value }) => {
      const date = new Date(value);
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
    },
    { toClassOnly: true },
  )
  endDate?: Date;
}
