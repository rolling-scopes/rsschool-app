import { ApiProperty } from '@nestjs/swagger';

export class ResultDto {
  @ApiProperty({ type: Number, required: false })
  score?: number;

  @ApiProperty({ type: Number, required: false })
  courseTaskId?: number;
}
