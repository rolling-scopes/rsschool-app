import { Student } from '@entities/student';
import { Certificate } from '@entities/certificate';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CertificatesController } from './certificates.controller';
import { CertifcationsService } from './certificates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, Student]), ConfigModule, NotificationsModule],
  controllers: [CertificatesController],
  providers: [CertifcationsService],
})
export class CertificatesModule {}
