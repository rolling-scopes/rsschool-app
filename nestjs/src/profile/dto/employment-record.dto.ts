import { EmploymentRecord } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EmploymentRecordDto {
  constructor(record: EmploymentRecord) {
    this.companyName = record.companyName;
    this.dateTo = record.dateTo;
    this.dateFrom = record.dateFrom;
    this.title = record.title;
    this.toPresent = record.toPresent;
    this.officeLocation = record.officeLocation;
  }

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

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  officeLocation?: string;
}
