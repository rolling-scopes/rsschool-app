import { ApiProperty } from '@nestjs/swagger';
import { Alert } from '@entities/alert';

export class AlertDto {
  constructor(alert: Alert) {
    this.id = alert.id;
    this.type = alert.type;
    this.text = alert.text;
    this.enabled = alert.enabled;
    this.courseId = alert.courseId;
    this.createdDate = alert.createdDate;
    this.updatedDate = alert.updatedDate;
  }

  @ApiProperty()
  id: number;
  @ApiProperty()
  type: string;
  @ApiProperty()
  text: string;
  @ApiProperty()
  enabled: boolean;
  @ApiProperty({ type: Number, nullable: true })
  courseId: number | null;
  @ApiProperty()
  updatedDate: string;
  @ApiProperty()
  createdDate: string;
}
