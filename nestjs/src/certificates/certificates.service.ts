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
    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3(this.configService.awsClient);
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
}
