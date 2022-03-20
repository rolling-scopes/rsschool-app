import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty()
  type: string;
  @ApiProperty()
  text: string;
  @ApiProperty({ required: false })
  enabled?: boolean;
  @ApiProperty({ required: false })
  courseId?: number;
}
