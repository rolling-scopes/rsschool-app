import { ApiProperty } from '@nestjs/swagger';

export class CertificateIssuanceRequestDto {
  @ApiProperty()
  public courseId: number;

  @ApiProperty()
  public courseName: string;

  @ApiProperty({ required: false, nullable: true })
  public coursePrimarySkill: string | null;

  @ApiProperty({ required: false, nullable: true })
  public certificateIssuer: string | null;

  @ApiProperty()
  public studentId: number;

  @ApiProperty()
  public studentName: string;

  @ApiProperty()
  public timestamp: number;

  constructor(payload: CertificateIssuanceRequestDto) {
    Object.assign(this, payload);
  }
}
