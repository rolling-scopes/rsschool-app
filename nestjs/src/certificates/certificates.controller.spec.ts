import type { Mocked } from 'vitest';
import { Readable } from 'stream';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
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

  const makeRes = () =>
    ({
      json: vi.fn(),
      set: vi.fn(),
    }) as unknown as Response;

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
      const res = makeRes();

      await expect(controller.getCertificate('abc', res)).rejects.toThrow(NotFoundException);
      expect(certificatesService.getByPublicId).toHaveBeenCalledWith('abc');
    });

    it('returns metadata as json for a .json public id', async () => {
      const certificate = { s3Bucket: 'b', s3Key: 'k' } as never;
      const metadata = { id: 'abc', name: 'John Doe' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      certificatesService.getCertificateMetadata.mockResolvedValue(metadata);
      const res = makeRes();

      await controller.getCertificate('abc.json', res);

      // .json suffix is stripped before lookup
      expect(certificatesService.getByPublicId).toHaveBeenCalledWith('abc');
      expect(certificatesService.getCertificateMetadata).toHaveBeenCalledWith(certificate);
      expect(res.json).toHaveBeenCalledWith(metadata);
    });

    it('streams the pdf for a non-json public id', async () => {
      const certificate = { s3Bucket: 'bucket', s3Key: 'key.pdf' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      const stream = { pipe: vi.fn() } as unknown as Readable;
      certificatesService.getFileStream.mockResolvedValue(stream);
      const res = makeRes();

      await controller.getCertificate('abc', res);

      expect(certificatesService.getFileStream).toHaveBeenCalledWith('bucket', 'key.pdf');
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(stream.pipe).toHaveBeenCalledWith(res);
    });

    it('throws NotFoundException when fetching the artifact fails', async () => {
      const certificate = { s3Bucket: 'bucket', s3Key: 'key.pdf' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      certificatesService.getFileStream.mockRejectedValue(new Error('S3 down'));
      const res = makeRes();

      await expect(controller.getCertificate('abc', res)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when building json metadata fails', async () => {
      const certificate = { s3Bucket: 'b', s3Key: 'k' } as never;
      certificatesService.getByPublicId.mockResolvedValue(certificate);
      certificatesService.getCertificateMetadata.mockRejectedValue(new Error('no course'));
      const res = makeRes();

      await expect(controller.getCertificate('abc.json', res)).rejects.toThrow(NotFoundException);
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
