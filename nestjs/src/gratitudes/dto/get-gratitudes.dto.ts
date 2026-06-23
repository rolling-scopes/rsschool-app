import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetGratitudesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  githubId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  courseId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  current?: number;
}

export class GratitudeFromUserDto {
  @ApiProperty()
  githubId: string;

  @ApiProperty({ nullable: true, type: String })
  firstName: string | null;

  @ApiProperty({ nullable: true, type: String })
  lastName: string | null;
}

export class GratitudeItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  badgeId: string;

  @ApiProperty()
  date: string;

  @ApiProperty({ nullable: true, type: String })
  comment: string | null;

  @ApiProperty()
  githubId: string;

  @ApiProperty({ nullable: true, type: String })
  firstName: string | null;

  @ApiProperty({ nullable: true, type: String })
  lastName: string | null;

  @ApiProperty({ nullable: true, type: String })
  countryName: string | null;

  @ApiProperty({ nullable: true, type: String })
  cityName: string | null;

  @ApiProperty()
  activist: boolean;

  @ApiProperty()
  user_id: number;

  @ApiProperty({ type: GratitudeFromUserDto })
  from: GratitudeFromUserDto;
}

export class GetGratitudesDto {
  constructor(data: { content: unknown[]; count: number }) {
    this.content = data.content as GratitudeItemDto[];
    this.count = data.count;
  }

  @ApiProperty({ type: [GratitudeItemDto] })
  content: GratitudeItemDto[];

  @ApiProperty()
  count: number;
}
