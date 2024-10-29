import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength, ValidateBy } from 'class-validator';
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
  @ValidateBy(
    {
      name: 'CommentContains@',
      validator: (value: string) => !value.includes('@'),
    },
    { message: 'The comment can not contain "@" symbol' },
  )
  @ApiProperty()
  comment: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Badge)
  @ApiProperty()
  badgeId: string;
}
