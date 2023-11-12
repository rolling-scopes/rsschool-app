import { IsNotEmpty, IsString } from 'class-validator';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  cityName: string;

  @IsString()
  @IsNotEmpty()
  countryName: string;
}
