import { ApiProperty } from '@nestjs/swagger';

export class ConsentDto {
  constructor(consent: boolean) {
    this.consent = consent;
  }
  @ApiProperty()
  public consent: boolean;
}
