import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { Badge } from './badge.dto';

export class CreateGratitudeDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ type: [Number] })
  userIds: number[];

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  courseId: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @ApiProperty()
  comment: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Badge)
  @ApiProperty()
  badgeId: string;
}
