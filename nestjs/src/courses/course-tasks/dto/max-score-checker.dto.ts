import { ApiProperty } from '@nestjs/swagger';

export class MaxScoreCheckerDto {
  @ApiProperty()
  checkerGithubId: string;

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  studentAvgScore: number;

  @ApiProperty()
  checkerScore: number;
}
