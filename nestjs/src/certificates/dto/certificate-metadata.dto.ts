import { Certificate } from '@entities/certificate';
import { Course } from '@entities/course';
import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class CertificateMetadataDto {
  constructor(certificate: Certificate, course: Course, user: User) {
    this.id = certificate.publicId;
    this.name = `${user.firstName} ${user.lastName}`;
    this.issueDate = certificate.issueDate.toISOString().split('T')[0] as string;
    this.issuer = 'RS School';
    this.courseTrainers = course.certificateIssuer;
    this.courseFullName = course.fullName;
    this.courseDiscipline = course.discipline?.name ?? 'N/A';
  }

  @ApiProperty()
  @IsString()
  public id: string;

  @ApiProperty()
  @IsString()
  public name: string;

  @ApiProperty()
  @IsDateString()
  public issueDate: string;

  @ApiProperty()
  @IsString()
  public issuer: string;

  @ApiProperty()
  @IsString()
  public courseTrainers: string;

  @ApiProperty()
  @IsString()
  public courseFullName: string;

  @ApiProperty()
  @IsString()
  public courseDiscipline: string;
}
