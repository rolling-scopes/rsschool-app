import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CountryStatDto {
  @IsString()
  @ApiProperty()
  public country: string;

  @IsInt()
  @ApiProperty()
  public studentsCount: number;
}

export class StudentsCountriesStatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: [CountryStatDto] })
  public countries: CountryStatDto[];
}
