import { Student } from '@entities/student';
import { Certificate } from '@entities/certificate';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { CertificatesController } from './certificates.controller';
import { CertifcationsService } from './certificates.service';
import { UsersNotificationsModule } from 'src/usersNotifications/usersNotifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, Student]), ConfigModule, UsersNotificationsModule],
  controllers: [CertificatesController],
  providers: [CertifcationsService],
})
export class CertificatesModule {}
