import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '@entities/certificate';
import { SaveCertificateDto } from './dto/save-certificate-dto';

import * as AWS from 'aws-sdk';
import { ConfigService } from 'src/config';
import { Student } from '@entities/student';

@Injectable()
export class CertifcationsService {
  private s3: AWS.S3;

  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
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

  public async saveCertificate(data: SaveCertificateDto) {
    let certificate = await this.getByPublicId(data.publicId);
    if (certificate) {
      await this.certificateRepository.update(certificate.id, data);
      return;
    }

    certificate = await this.certificateRepository.findOne({ where: { studentId: data.studentId } });
    if (certificate) {
      await this.certificateRepository.update(certificate.id, data);
      return;
    }

    await this.certificateRepository.save(data);
  }

  public async buildNotificationData(data: SaveCertificateDto) {
    const student = await this.studentRepository.findOne(data.studentId, {
      relations: ['course'],
    });
    return {
      userId: student.userId,
      notification: {
        course: student.course,
        publicId: data.publicId,
      },
    };
  }
}
