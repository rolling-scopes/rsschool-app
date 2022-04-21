import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '@entities/certificate';
import { SaveCertificateDto } from './dto/save-certificate-dto';

import * as AWS from 'aws-sdk';
import { ConfigService } from 'src/config';
import { Student } from '@entities/student';
import { Course } from '@entities/course';

@Injectable()
export class CertificationsService {
  private s3: AWS.S3;

  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private readonly configService: ConfigService,
  ) {
    AWS.config.update({
      region: 'eu-central-1',
      secretAccessKey: this.configService.awsServices.secretAccessKey,
      accessKeyId: this.configService.awsServices.accessKeyId,
    });

    this.s3 = new AWS.S3();
  }

  public async getByPublicId(publicId: string) {
    return await this.certificateRepository.findOne({ where: { publicId } });
  }

  public getFileStream(bucket: string, key: string) {
    return this.s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
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
    const course = await this.courseRepository.findOneOrFail(student.courseId);
    return {
      userId: student.userId,
      notification: {
        course: course,
        publicId: data.publicId,
      },
    };
  }
}
