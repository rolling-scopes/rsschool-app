import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MentorReviewsQueryDto {
  @ApiProperty()
  @IsString()
  public current: string;

  @ApiProperty()
  @IsString()
  public pageSize: string;
}
