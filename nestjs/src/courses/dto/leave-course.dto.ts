import { ApiProperty } from '@nestjs/swagger';

export class LeaveCourseRequestDto {
  @ApiProperty({ required: false })
  reasonForLeaving?: string[];

  @ApiProperty({ required: false })
  otherComment?: string;
}
