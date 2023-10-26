import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CountryDto {
  constructor({ countryName }: { countryName: string }) {
    this.countryName = countryName;
  }

  @ApiProperty({ type: String })
  @IsString()
  countryName: string;
}
