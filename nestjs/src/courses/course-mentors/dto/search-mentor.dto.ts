import { ApiProperty } from '@nestjs/swagger';

export class SearchMentorDto {
  constructor({ id, githubId, name }: { id: number; githubId: string; name: string }) {
    this.id = id;
    this.githubId = githubId;
    this.name = name;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  githubId: string;

  @ApiProperty()
  name: string;
}
