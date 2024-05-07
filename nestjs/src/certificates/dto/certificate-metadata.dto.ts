import { Certificate } from '@entities/certificate';
import { Course } from '@entities/course';
import { User } from '@entities/user';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export enum CertificateCourseType {
  Angular = 'Angular',
  React = 'React',
  AWS_Fundamentals = 'AWS Fundamentals',
  AWS_Cloud_Developer = 'AWS Cloud Developer',
  Javascript_Frontend = 'JavaScript / Front-end',
  Javascript_Frontend_Fundamentals = 'JavaScript / Front-end Fundamentals',
  Nodejs = 'Node.js',
  MachineLearning = 'Machine Learning',
  Go = 'Go',
  iOS = 'iOS',
  Android = 'Android',
  Other = 'Other',
}

export class CertificateMetadataDto {
  constructor(certificate: Certificate, course: Course, user: User) {
    this.id = certificate.publicId;
    this.name = `${user.firstName} ${user.lastName}`;
    this.issueDate = certificate.issueDate.toISOString().split('T')[0] as string;
    this.issuer = 'RS School';
    this.courseType = mapToCourseType(course);
    this.courseFullName = course.fullName;
    this.courseTrainers = course.certificateIssuer ?? 'Dzmitry Varabei';
    this.courseDiscipline = course.discipline?.name ?? 'Other';
  }

  @ApiProperty()
  @IsString()
  public readonly id: string;

  @ApiProperty()
  @IsString()
  public readonly name: string;

  @ApiProperty()
  @IsDateString()
  public readonly issueDate: string;

  @ApiProperty()
  @IsString()
  public readonly issuer: string;

  @ApiProperty()
  @IsString()
  public readonly courseType: CertificateCourseType;

  @ApiProperty()
  @IsString()
  public readonly courseTrainers: string;

  @ApiProperty()
  @IsString()
  public readonly courseFullName: string;

  @ApiProperty()
  @IsString()
  public readonly courseDiscipline: string;
}

function mapToCourseType(course: Course): CertificateCourseType {
  const disciplineName = course.discipline?.name.toLowerCase();
  switch (disciplineName) {
    case 'react':
      return CertificateCourseType.React;
    case 'angular':
      return CertificateCourseType.Angular;
    case 'aws':
      if (course.fullName.includes('Cloud Developer')) {
        return CertificateCourseType.AWS_Cloud_Developer;
      }
      return CertificateCourseType.AWS_Fundamentals;
    case 'nodejs':
      return CertificateCourseType.Nodejs;
    case 'machine learning':
      return CertificateCourseType.MachineLearning;
    case 'go':
      return CertificateCourseType.Go;
    case 'ios':
      return CertificateCourseType.iOS;
    case 'android':
      return CertificateCourseType.Android;
    case 'javascript':
      if (course.fullName.includes('Pre-School')) {
        return CertificateCourseType.Javascript_Frontend_Fundamentals;
      }
      return CertificateCourseType.Javascript_Frontend;
    default:
      return CertificateCourseType.Other;
  }
}
