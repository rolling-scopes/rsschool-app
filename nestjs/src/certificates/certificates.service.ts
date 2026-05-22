import { Readable } from 'stream';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '@entities/certificate';
import { SaveCertificateDto } from './dto/save-certificate-dto';

import { ConfigService } from 'src/config';
import { Student } from '@entities/student';
import { Course } from '@entities/course';
import { User } from '@entities/user';
import { CertificateMetadataDto } from './dto/certificate-metadata.dto';
import { CertificateIssuanceRequestDto } from './dto/certificate-issuance-request.dto';
import { CloudApiService } from '../cloud-api/cloud-api.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CertificationsService {
  private s3: S3;

  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly cloudApi: CloudApiService,
  ) {
    this.s3 = new S3(this.configService.awsClient);
  }

  public async requestCertificateIssuance(courseId: number, githubId: string): Promise<CertificateIssuanceRequestDto> {
    const student = await this.studentRepository.findOne({
      where: {
        courseId,
        user: { githubId: githubId.toLowerCase() },
      },
      relations: ['user', 'course', 'course.discipline'],
    });

    if (!student) {
      throw new NotFoundException(`No student found for course ${courseId} / github "${githubId}"`);
    }

    const payload = new CertificateIssuanceRequestDto({
      courseId,
      courseName: student.course.name,
      coursePrimarySkill: student.course.discipline?.name ?? student.course.primarySkillName ?? null,
      certificateIssuer: student.course.certificateIssuer ?? null,
      studentId: student.id,
      studentName: [student.user.firstName, student.user.lastName].filter(Boolean).join(' ').trim(),
      timestamp: Date.now(),
    });

    await this.cloudApi.requestCertificate(payload);
    return payload;
  }

  public async getByPublicId(publicId: string) {
    return this.certificateRepository.findOne({
      where: { publicId },
      relations: ['student'],
    });
  }

  public async getCertificateMetadata(certificate: Certificate): Promise<CertificateMetadataDto> {
    const [user, course] = await Promise.all([
      this.userRepository.findOneByOrFail({ id: certificate.student.userId }),
      this.courseRepository.findOne({
        where: { id: certificate.student.courseId },
        relations: ['discipline'],
      }),
    ]);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return new CertificateMetadataDto(certificate, course, user);
  }

  public async getFileStream(bucket: string, key: string) {
    const { Body } = await this.s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return Body as Readable;
  }

  public async saveCertificate(studentId: number, data: SaveCertificateDto) {
    let certificate = await this.getByPublicId(data.publicId);
    if (certificate) {
      await this.certificateRepository.update(certificate.id, data);
      return;
    }

    certificate = await this.certificateRepository.findOne({ where: { studentId } });
    if (certificate) {
      await this.certificateRepository.update(certificate.id, data);
      return;
    }

    await this.certificateRepository.save(data);
  }

  public async buildNotificationData(student: Student, data: SaveCertificateDto) {
    const course = await this.courseRepository.findOneByOrFail({ id: student.courseId });
    return {
      userId: student.userId,
      notification: {
        course: course,
        publicId: data.publicId,
      },
    };
  }

  public async removeCertificate(studentId: number) {
    const certificate = await this.certificateRepository.findOneOrFail({
      where: { studentId },
    });

    await Promise.all([
      lastValueFrom(
        this.httpService.delete(`${this.configService.awsServices.restApiUrl}/certificate/${certificate.s3Key}`),
      ),
      this.certificateRepository.remove(certificate),
    ]);
  }
}
