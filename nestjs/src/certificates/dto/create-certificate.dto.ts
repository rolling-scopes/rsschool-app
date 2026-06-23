import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CertificateCriteriaDto {
  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  courseTaskIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minTotalScore?: number;
}

export class CreateStudentCertificateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;
}

export class CreateCourseCertificatesDto {
  @ApiPropertyOptional({ type: CertificateCriteriaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CertificateCriteriaDto)
  criteria?: CertificateCriteriaDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;
}

export class CertificateRequestDto {
  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseName: string;

  @ApiProperty({ nullable: true, type: String })
  coursePrimarySkill: string | null;

  @ApiProperty({ nullable: true, type: String })
  certificateIssuer: string | null;

  @ApiProperty()
  studentId: number;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  templateId: string;
}
