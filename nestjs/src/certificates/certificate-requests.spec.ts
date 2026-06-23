import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Certificate } from '@entities/certificate';
import { Student } from '@entities/student';
import { Course } from '@entities/course';
import { User } from '@entities/user';
import { ConfigService } from 'src/config';
import { CertificatesController } from './certificates.controller';
import { CertificationsService } from './certificates.service';
import { StudentsService } from '../courses/students';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';

// Fixtures mirrored from server/src/routes/course/__test__/certificates.test.ts to prove business-logic equivalence
const mockStudent = {
  id: 42,
  user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe' },
  course: {
    name: 'JS 2026',
    primarySkillName: 'JavaScript',
    certificateIssuer: 'RS School',
    discipline: { name: 'JS / FE' },
  },
};

const studentRepository = { findOne: vi.fn(), createQueryBuilder: vi.fn() };
const mockPost = vi.fn();

const createQb = (students: unknown[]) => {
  const qb = {
    innerJoin: vi.fn(),
    addSelect: vi.fn(),
    leftJoinAndSelect: vi.fn(),
    where: vi.fn(),
    getMany: vi.fn().mockResolvedValue(students),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.leftJoinAndSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  return qb;
};

describe('certificate requests', () => {
  let controller: CertificatesController;
  let service: CertificationsService;

  beforeEach(async () => {
    Object.values(studentRepository).forEach(fn => fn.mockReset());
    mockPost.mockReset().mockReturnValue(of({ data: {} }));
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [
        CertificationsService,
        { provide: getRepositoryToken(Certificate), useValue: {} },
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        {
          provide: ConfigService,
          useValue: {
            awsServices: { restApiUrl: 'https://aws.example.com', restApiKey: 'secret-key' },
            awsClient: { region: 'eu-central-1', credentials: { accessKeyId: 'x', secretAccessKey: 'y' } },
          },
        },
        { provide: HttpService, useValue: { post: mockPost } },
        { provide: StudentsService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CertificatesController);
    service = module.get(CertificationsService);
  });

  describe('createStudentCertificate', () => {
    it('builds certificate request with discipline-based skill and posts it to the AWS gateway', async () => {
      studentRepository.findOne.mockResolvedValue(mockStudent);

      const result = await controller.createStudentCertificate(5, 'john-doe', { templateId: 'bootcamp_13_weeks' });

      const expected = {
        courseId: 5,
        courseName: 'JS 2026',
        coursePrimarySkill: 'JS / FE',
        certificateIssuer: 'RS School',
        studentId: 42,
        studentName: 'John Doe',
        timestamp: expect.any(Number),
        templateId: 'bootcamp_13_weeks',
      };
      expect(mockPost).toHaveBeenCalledWith('https://aws.example.com/certificate', expect.objectContaining(expected), {
        headers: { 'x-api-key': 'secret-key' },
      });
      expect(result).toEqual(expect.objectContaining(expected));
    });

    it('falls back to the default template for unknown template ids', async () => {
      studentRepository.findOne.mockResolvedValue(mockStudent);

      const result = await controller.createStudentCertificate(5, 'john-doe', { templateId: 'hacked' });

      expect(result.templateId).toBe('default');
    });

    it('responds 400 when student is not found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      await expect(controller.createStudentCertificate(5, 'john-doe', {})).rejects.toThrow(BadRequestException);
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('createCourseCertificates', () => {
    it('returns empty list without AWS call when criteria matched no students', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([] as never);

      const result = await controller.createCourseCertificates(5, { criteria: { minTotalScore: 100 } });

      expect(result).toEqual([]);
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('builds requests for matched students and posts them to the AWS gateway', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([42] as never);
      const qb = createQb([mockStudent]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      await controller.createCourseCertificates(5, { criteria: { minTotalScore: 100 } });

      expect(qb.where).toHaveBeenCalledWith('student."id" IN (:...ids)', { ids: [42] });
      expect(mockPost).toHaveBeenCalledWith(
        'https://aws.example.com/certificate',
        [expect.objectContaining({ studentId: 42, templateId: 'default', courseName: 'JS 2026' })],
        { headers: { 'x-api-key': 'secret-key' } },
      );
    });

    it('targets students without certificates when criteria are empty', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([] as never);
      const qb = createQb([]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      await controller.createCourseCertificates(5, { criteria: {} });

      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('student.certificate', 'certificate');
      expect(qb.where).toHaveBeenCalledWith(
        'certificate.id IS NULL AND student."courseId" = :courseId AND student."isExpelled" = false AND student."isFailed" = false',
        { courseId: 5 },
      );
      // legacy posted to the gateway even when the fallback matched no students
      expect(mockPost).toHaveBeenCalledWith('https://aws.example.com/certificate', [], expect.anything());
    });
  });
});
