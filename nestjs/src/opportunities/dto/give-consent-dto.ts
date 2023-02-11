import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class GiveConsentDto {
  constructor(consent: boolean, expires: number) {
    this.consent = consent;
    this.expires = expires;
  }

  @ApiProperty()
  @IsBoolean()
  public consent: boolean;

  @ApiProperty()
  @IsNumber()
  public expires: number;
}
