import { ApiProperty } from '@nestjs/swagger';

export class EligibleStudentDto {
  @ApiProperty()
  public studentId: number;

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public totalScore: number;

  constructor(params: EligibleStudentDto) {
    Object.assign(this, params);
  }
}
