import { ApiProperty } from '@nestjs/swagger';

export class ProfileInfoExtendedDto {
  constructor(data: {
    permissionsSettings?: object;
    generalInfo?: object;
    contacts?: object;
    discord?: object | null;
    mentorStats?: object[];
    publicFeedback?: object[];
    stageInterviewFeedback?: object[];
    studentStats?: object[];
  }) {
    Object.assign(this, data);
  }

  @ApiProperty({ type: Object, required: false })
  permissionsSettings?: object;

  @ApiProperty({ type: Object, required: false })
  generalInfo?: object;

  @ApiProperty({ type: Object, required: false })
  contacts?: object;

  @ApiProperty({ type: Object, nullable: true, required: false })
  discord?: object | null;

  @ApiProperty({ type: [Object], required: false })
  mentorStats?: object[];

  @ApiProperty({ type: [Object], required: false })
  publicFeedback?: object[];

  @ApiProperty({ type: [Object], required: false })
  stageInterviewFeedback?: object[];

  @ApiProperty({ type: [Object], required: false })
  studentStats?: object[];
}
