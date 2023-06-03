import { Body, Controller, Get, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { StudentsService } from '../courses/students';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CertificationsService } from './certificates.service';
import { SaveCertificateDto } from './dto/save-certificate-dto';

@Controller('certificate')
@ApiTags('certificate')
export class CertificatesController {
  constructor(
    private certificatesService: CertificationsService,
    private notificationService: UserNotificationsService,
    private studentsService: StudentsService,
  ) {}

  @Get('/:publicId')
  @ApiOperation({ operationId: 'getCertificate' })
  public async getCertificate(@Param('publicId') publicId: string, @Res() res: Response) {
    const certificate = await this.certificatesService.getByPublicId(publicId);
    if (!certificate) throw new NotFoundException('not found');

    try {
      const stream = this.certificatesService.getFileStream(certificate.s3Bucket, certificate.s3Key);
      res.set('Content-Type', 'application/pdf');
      stream.pipe(res);
    } catch {
      throw new NotFoundException('not found');
    }
  }

  @Post('/')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'saveCertificate' })
  public async saveCertificate(@Body() dto: SaveCertificateDto) {
    const student = await this.studentsService.getById(dto.studentId);

    const [notificationData] = await Promise.all([
      this.certificatesService.buildNotificationData(student, dto),
      this.certificatesService.saveCertificate(student.id, dto),
    ]);

    const { userId, notification } = notificationData;

    await this.notificationService.sendEventNotification({
      data: notification,
      notificationId: 'courseCertificate',
      userId: userId,
    });
  }
}
