import { ApiProperty } from '@nestjs/swagger';

export class BadCommentCheckerDto {
  @ApiProperty()
  checkerGithubId: string;

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  checkerScore: number;

  @ApiProperty()
  comment: string;
}
