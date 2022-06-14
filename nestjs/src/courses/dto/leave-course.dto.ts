import { ApiProperty } from '@nestjs/swagger';

export class LeaveCourseRequestDto {
  @ApiProperty({ required: false })
  comment?: string;
}
