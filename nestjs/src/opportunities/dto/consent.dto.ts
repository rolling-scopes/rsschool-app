import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ConsentDto {
  constructor(consent: boolean) {
    this.consent = consent;
  }

  @ApiProperty()
  @IsBoolean()
  public consent: boolean;
}
