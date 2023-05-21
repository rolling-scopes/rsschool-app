import { Readable } from 'stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '@entities/certificate';
import { SaveCertificateDto } from './dto/save-certificate-dto';

import { ConfigService } from 'src/config';
import { Student } from '@entities/student';
import { Course } from '@entities/course';

@Injectable()
export class CertificationsService {
  private s3: S3Client;

  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: 'eu-central-1',
      credentials: {
        secretAccessKey: this.configService.awsServices.secretAccessKey,
        accessKeyId: this.configService.awsServices.accessKeyId,
      },
    });
  }

  public async getByPublicId(publicId: string) {
    return await this.certificateRepository.findOne({ where: { publicId } });
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
