import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class JobFoundDto {
  constructor({ jobFound, jobFoundCompanyName, jobFoundOfficeLocation }: JobFoundDto) {
    this.jobFound = jobFound;
    this.jobFoundCompanyName = jobFoundCompanyName;
    this.jobFoundOfficeLocation = jobFoundOfficeLocation;
  }

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  public jobFound: boolean;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  public jobFoundCompanyName?: string | null;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  public jobFoundOfficeLocation?: string | null;
}
