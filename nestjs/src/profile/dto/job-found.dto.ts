import { EmploymentRecord } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class JobFoundDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  @Expose()
  public jobFound: boolean;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  public jobFoundCompanyName?: string | null;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  public jobFoundOfficeLocation?: string | null;

  public static jobFoundToEmploymentRecord(jobFound: JobFoundDto) {
    return {
      title: '',
      dateTo: '',
      dateFrom: '',
      companyName: jobFound.jobFoundCompanyName ?? '',
      officeLocation: jobFound.jobFoundOfficeLocation ?? '',
      toPresent: true,
    };
  }

  public static employmentRecordToJobFound(employmentRecord: EmploymentRecord | undefined) {
    if (!employmentRecord) {
      return null;
    }

    return {
      jobFound: true,
      jobFoundCompanyName: employmentRecord.companyName,
      jobFoundOfficeLocation: employmentRecord.officeLocation,
    };
  }
}
