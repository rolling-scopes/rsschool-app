import { ApiProperty } from '@nestjs/swagger';

export class EndorsmentDto {
  constructor(profile: { content: string } | null) {
    this.summary = profile?.content ?? 'We do not have enough data to generate endorsment.';
  }

  @ApiProperty({ type: String })
  public summary: string;
}
