import { Resume } from '@entities/resume';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  constructor(profile: { resume?: Resume }) {
    this.publicCvUrl = profile.resume?.uuid ? `/cv/${profile.resume.uuid}` : null;
  }

  @ApiProperty({ type: String, nullable: true })
  public publicCvUrl: string | null;
}
