import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsString } from 'class-validator';

export class SaveCertificateDto {
  @ApiProperty()
  @IsString()
  public publicId: string;

  @ApiProperty()
  @IsNumber()
  public studentId: number;

  @ApiProperty()
  @IsString()
  s3Bucket: string;

  @ApiProperty()
  @IsString()
  s3Key: string;

  @ApiProperty()
  @IsDateString()
  issueDate: string;
}
