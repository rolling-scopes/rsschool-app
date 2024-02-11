import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CountryStatDto {
  @IsString()
  @ApiProperty()
  public countryName: string;

  @IsInt()
  @ApiProperty()
  public count: number;
}

export class CountriesStatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: [CountryStatDto] })
  public countries: CountryStatDto[];
}
