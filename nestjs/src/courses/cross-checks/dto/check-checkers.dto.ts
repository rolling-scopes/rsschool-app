import { ApiProperty } from '@nestjs/swagger';

export class MaxScoreCheckerDto {
  @ApiProperty()
  taskName: string;

  @ApiProperty()
  checkerGithubId: string;

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty({ nullable: true, type: String })
  studentAverageScoreExcludeChecker: string | null;

  @ApiProperty()
  checkerScore: number;

  @ApiProperty()
  studentAvgScore: number;

  @ApiProperty()
  key: string;
}

export class BadCommentCheckerDto {
  @ApiProperty()
  taskName: string;

  @ApiProperty()
  checkerGithubId: string;

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  checkerScore: number;

  @ApiProperty({ nullable: true, type: String })
  comment: string | null;

  @ApiProperty()
  key: string;
}
