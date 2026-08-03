import type { Mocked } from 'vitest';
import { Readable } from 'stream';
import { NotFoundException, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CertificatesController } from './certificates.controller';
import { CertificationsService } from './certificates.service';
import { StudentsService } from '../courses/students';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CERTIFICATE_TEMPLATES } from './templates/catalog';

describe('CertificatesController', () => {
  let controller: CertificatesController;
  let certificatesService: Mocked<CertificationsService>;
  let notificationService: Mocked<UserNotificationsService>;
  let studentsService: Mocked<StudentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [
        {
          provide: CertificationsService,
          useValue: {
            getByPublicId: vi.fn(),
            getCertificateMetadata: vi.fn(),
            getFileStream: vi.fn(),
            buildNotificationData: vi.fn(),
            saveCertificate: vi.fn(),
            removeCertificate: vi.fn(),
          },
        },
        { provide: UserNotificationsService, useValue: { sendEventNotification: vi.fn() } },
        { provide: StudentsService, useValue: { getById: vi.fn() } },
      ],
    }).compile();

    controller = module.get(CertificatesController);
    certificatesService = module.get(CertificationsService);
    notificationService = module.get(UserNotificationsService);
    studentsService = module.get(StudentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTemplates', () => {
    it('returns the static certificate templates catalog', () => {
      expect(controller.getTemplates()).toBe(CERTIFICATE_TEMPLATES);
    });
  });

  describe('getCertificate', () => {
    it('throws NotFoundException when no certificate matches the public id', async () => {
      certificatesService.getByPublicId.mockResolvedValue(null);

      await expect(controller.getCertificate('abc')).rejects.toThrow(NotFoundException);
      expect(certificatesService.getByPublicId).toHaveBeenCalledWith('abc');
    });

    it('returns metadata as json for a .json public id', async () => {
      const certificate = { s3Bucket: 'b', s3Key: 'k' } as never;
      const metadata = { id: 'abc', name: 'John Doe' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      certificatesService.getCertificateMetadata.mockResolvedValue(metadata);

      const result = await controller.getCertificate('abc.json');

      // .json suffix is stripped before lookup
      expect(certificatesService.getByPublicId).toHaveBeenCalledWith('abc');
      expect(certificatesService.getCertificateMetadata).toHaveBeenCalledWith(certificate);
      expect(result).toEqual(metadata);
    });

    it('streams the pdf for a non-json public id', async () => {
      const certificate = { s3Bucket: 'bucket', s3Key: 'key.pdf' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      const stream = Readable.from(['%PDF']);
      certificatesService.getFileStream.mockResolvedValue(stream);

      const file = await controller.getCertificate('abc');

      expect(certificatesService.getFileStream).toHaveBeenCalledWith('bucket', 'key.pdf');
      expect(file).toBeInstanceOf(StreamableFile);
      expect((file as StreamableFile).getHeaders()).toEqual({ type: 'application/pdf' });
      // the controller wraps the exact service stream without re-reading it
      expect((file as StreamableFile).getStream()).toBe(stream);
    });

    it('throws NotFoundException when fetching the artifact fails', async () => {
      const certificate = { s3Bucket: 'bucket', s3Key: 'key.pdf' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      certificatesService.getFileStream.mockRejectedValue(new Error('S3 down'));

      await expect(controller.getCertificate('abc')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when building json metadata fails', async () => {
      const certificate = { s3Bucket: 'b', s3Key: 'k' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      certificatesService.getCertificateMetadata.mockRejectedValue(new Error('no course'));

      await expect(controller.getCertificate('abc.json')).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveCertificate', () => {
    it('saves the certificate, builds notification data and dispatches the event', async () => {
      const dto = { studentId: 42, publicId: 'abc' } as never;
      const student = { id: 42, userId: 7, courseId: 3 } as never;
      const notificationData = { userId: 7, notification: { course: { id: 3 }, publicId: 'abc' } } as never;

      studentsService.getById.mockResolvedValue(student);
      certificatesService.buildNotificationData.mockResolvedValue(notificationData);
      certificatesService.saveCertificate.mockResolvedValue(undefined);
      notificationService.sendEventNotification.mockResolvedValue(undefined as never);

      await controller.saveCertificate(dto);

      expect(studentsService.getById).toHaveBeenCalledWith(42);
      expect(certificatesService.buildNotificationData).toHaveBeenCalledWith(student, dto);
      expect(certificatesService.saveCertificate).toHaveBeenCalledWith(42, dto);
      expect(notificationService.sendEventNotification).toHaveBeenCalledWith({
        data: { course: { id: 3 }, publicId: 'abc' },
        notificationId: 'courseCertificate',
        userId: 7,
      });
    });
  });

  describe('removeCertificate', () => {
    it('delegates removal to the service', async () => {
      certificatesService.removeCertificate.mockResolvedValue(undefined);

      await controller.removeCertificate(99);

      expect(certificatesService.removeCertificate).toHaveBeenCalledWith(99);
    });
  });
});
