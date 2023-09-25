import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { LocationDto } from './location.dto';

export class EmploymentRecordDto {
  @ApiProperty({ type: String })
  @IsString()
  title: string;

  @ApiProperty({ type: String })
  @IsString()
  dateTo: string;

  @ApiProperty({ type: String })
  @IsString()
  dateFrom: string;

  @ApiProperty({ type: String })
  @IsString()
  companyName: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  toPresent: boolean;

  @ApiProperty({ required: false, type: LocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  officeLocation?: LocationDto;
}
