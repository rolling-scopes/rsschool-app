import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MentorReviewsQueryDto {
  @ApiProperty()
  @IsString()
  public current: string;

  @ApiProperty()
  @IsString()
  public pageSize: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public tasks: string;
}
