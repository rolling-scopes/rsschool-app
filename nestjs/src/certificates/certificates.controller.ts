import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CourseRole, DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { StudentsService } from '../courses/students';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CertificationsService } from './certificates.service';
import { SaveCertificateDto } from './dto/save-certificate-dto';
import { CertificateRequestDto, CreateCourseCertificatesDto, CreateStudentCertificateDto } from './dto/create-certificate.dto';
import { CERTIFICATE_TEMPLATES } from './templates/catalog';

@Controller('certificate')
@ApiTags('certificate')
export class CertificatesController {
  constructor(
    private certificatesService: CertificationsService,
    private notificationService: UserNotificationsService,
    private studentsService: StudentsService,
  ) {}

  @Post('/course/:courseId/student/:githubId')
  @ApiOperation({ operationId: 'createStudentCertificate' })
  @ApiOkResponse({ type: CertificateRequestDto })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  public async createStudentCertificate(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
    @Body() dto: CreateStudentCertificateDto,
  ) {
    const request = await this.certificatesService.buildStudentCertificateRequest(courseId, githubId, dto.templateId);
    if (request == null) {
      throw new BadRequestException('No student');
    }
    await this.certificatesService.requestCertificates(request);
    return request;
  }

  @Post('/course/:courseId')
  @ApiOperation({ operationId: 'createCourseCertificates' })
  @ApiOkResponse({ type: [CertificateRequestDto] })
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  public async createCourseCertificates(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateCourseCertificatesDto,
  ) {
    const { requests, shortCircuit } = await this.certificatesService.buildCourseCertificateRequests(courseId, dto);
    if (!shortCircuit) {
      await this.certificatesService.requestCertificates(requests);
    }
    return requests;
  }

  @Get('/templates')
  @ApiOperation({ operationId: 'getCertificateTemplates' })
  public getTemplates() {
    return CERTIFICATE_TEMPLATES;
  }

  /**
   * /certificate/abc - returns certificate in PDF format
   * /certificate/abc.json - returns certificate metadata in JSON format
   */
  @Get('/:publicId')
  @ApiOperation({ operationId: 'getCertificate' })
  public async getCertificate(@Param('publicId') publicId: string, @Res() res: Response) {
    const normalizedPublicId = publicId.endsWith('.json') ? publicId.slice(0, -5) : publicId;
    const responseType = publicId.endsWith('.json') ? 'json' : 'pdf';

    const certificate = await this.certificatesService.getByPublicId(normalizedPublicId);
    if (!certificate) throw new NotFoundException();

    try {
      switch (responseType) {
        case 'json': {
          const metadata = await this.certificatesService.getCertificateMetadata(certificate);
          res.json(metadata);
          break;
        }
        case 'pdf': {
          const stream = await this.certificatesService.getFileStream(certificate.s3Bucket, certificate.s3Key);
          res.set('Content-Type', 'application/pdf');
          stream.pipe(res);
          break;
        }
      }
    } catch {
      throw new NotFoundException();
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

  @Delete('/:studentId')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'removeCertificate' })
  public async removeCertificate(@Param('studentId', ParseIntPipe) studentId: number) {
    await this.certificatesService.removeCertificate(studentId);
  }
}
