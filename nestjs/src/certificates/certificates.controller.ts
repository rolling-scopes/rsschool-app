import {
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
import { BulkIssueResultDto } from './dto/bulk-issue-result.dto';
import { CertificateCriteriaDto } from './dto/certificate-criteria.dto';
import { CertificateIssuanceRequestDto } from './dto/certificate-issuance-request.dto';
import { EligibleStudentsPreviewDto } from './dto/eligible-students-preview.dto';
import { SaveCertificateDto } from './dto/save-certificate-dto';
import { CERTIFICATE_TEMPLATES } from './templates/catalog';

@Controller('certificate')
@ApiTags('certificate')
export class CertificatesController {
  constructor(
    private certificatesService: CertificationsService,
    private notificationService: UserNotificationsService,
    private studentsService: StudentsService,
  ) {}

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

  @Post('/course/:courseId/student/:githubId')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  @ApiOperation({ operationId: 'issueCertificate' })
  @ApiOkResponse({ type: CertificateIssuanceRequestDto })
  public async issueCertificate(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('githubId') githubId: string,
  ): Promise<CertificateIssuanceRequestDto> {
    return this.certificatesService.requestCertificateIssuance(courseId, githubId);
  }

  @Post('/course/:courseId/eligible')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  @ApiOperation({ operationId: 'previewEligibleStudents' })
  @ApiOkResponse({ type: EligibleStudentsPreviewDto })
  public async previewEligibleStudents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() criteria: CertificateCriteriaDto,
  ): Promise<EligibleStudentsPreviewDto> {
    return this.certificatesService.previewEligibleStudents(courseId, criteria);
  }

  @Post('/course/:courseId/bulk')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([CourseRole.Manager, Role.Admin], true)
  @ApiOperation({ operationId: 'issueCertificatesBulk' })
  @ApiOkResponse({ type: BulkIssueResultDto })
  public async issueCertificatesBulk(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() criteria: CertificateCriteriaDto,
  ): Promise<BulkIssueResultDto> {
    return this.certificatesService.requestBulkCertificateIssuance(courseId, criteria);
  }
}
