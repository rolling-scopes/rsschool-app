import { ApiProperty } from '@nestjs/swagger';

export class EndorsementDto {
  constructor(profile: { content: string; data: object } | null) {
    this.summary = profile?.content ?? 'We do not have enough data to generate endorsement.';
    this.data = profile?.data ?? null;
  }

  @ApiProperty({ type: String })
  public summary: string;

  @ApiProperty({ type: Object, nullable: true })
  public data: object | null;
}
