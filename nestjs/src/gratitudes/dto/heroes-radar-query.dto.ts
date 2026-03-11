import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import * as dayjs from 'dayjs';

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
  @Transform(({ value }) => dayjs(value).utc().endOf('day').toDate(), { toClassOnly: true })
  endDate?: Date;
}
