import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CountryStatDto {
  @IsString()
  @ApiProperty()
  public country: string;

  @IsInt()
  @ApiProperty()
  public studentsCount: number;
}

export class StudentsCountriesStatsDto {
  @IsInt()
  @ApiProperty()
  public studentsActiveCount: number;

  @IsInt()
  @ApiProperty()
  public studentsTotalCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({ type: [CountryStatDto] })
  public countries: CountryStatDto[];
}
