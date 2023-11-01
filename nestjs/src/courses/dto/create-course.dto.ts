import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  alias: string;

  @ApiProperty({ required: false })
  registrationEndDate: string;

  @ApiProperty({ required: false })
  completed: boolean;

  @ApiProperty({ required: false })
  planned: boolean;

  @ApiProperty({ required: false })
  inviteOnly: boolean;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  disciplineId: number;

  @ApiProperty({ required: false })
  discordServerId: number;

  @ApiProperty({ required: false })
  usePrivateRepositories: boolean;

  @ApiProperty({ required: false })
  certificateIssuer: string;

  @ApiProperty({ required: false })
  personalMentoring: boolean;

  @ApiProperty({ required: false })
  logo: string;
}
