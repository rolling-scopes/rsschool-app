import { ApiProperty } from '@nestjs/swagger';

export class EndorsementDto {
  constructor(profile: { content: string } | null) {
    this.summary = profile?.content ?? 'We do not have enough data to generate endorsement.';
  }

  @ApiProperty({ type: String })
  public summary: string;
}
