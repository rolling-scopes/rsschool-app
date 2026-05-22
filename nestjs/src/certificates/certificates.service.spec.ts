import { Certificate } from '@entities/certificate';
import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { User } from '@entities/user';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { vi } from 'vitest';
import { CloudApiService } from '../cloud-api/cloud-api.service';
import { ConfigService } from '../config';
import { CertificationsService } from './certificates.service';

describe('CertificationsService.requestCertificateIssuance', () => {
  const studentRow = {
    id: 42,
    course: {
      name: 'Course X',
      certificateIssuer: 'RS School',
      primarySkillName: 'JS',
      discipline: { name: 'Frontend' },
    },
    user: { firstName: 'Ada', lastName: 'Lovelace' },
  };

  let studentRepoFindOne: ReturnType<typeof vi.fn>;
  let cloudApi: { requestCertificate: ReturnType<typeof vi.fn> };
  let service: CertificationsService;

  beforeEach(async () => {
    studentRepoFindOne = vi.fn();
    cloudApi = { requestCertificate: vi.fn().mockResolvedValue({}) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CertificationsService,
        { provide: getRepositoryToken(Certificate), useValue: {} },
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: { findOne: studentRepoFindOne } },
        { provide: ConfigService, useValue: { awsClient: {} } },
        { provide: HttpService, useValue: {} },
        { provide: CloudApiService, useValue: cloudApi },
      ],
    }).compile();

    service = moduleRef.get(CertificationsService);
  });

  it('throws NotFoundException when student is missing', async () => {
    studentRepoFindOne.mockResolvedValue(null);

    await expect(service.requestCertificateIssuance(1, 'ghost')).rejects.toBeInstanceOf(NotFoundException);
    expect(cloudApi.requestCertificate).not.toHaveBeenCalled();
  });

  it('builds a payload and forwards it to the cloud API', async () => {
    studentRepoFindOne.mockResolvedValue(studentRow);

    const payload = await service.requestCertificateIssuance(7, 'Ada-Lovelace');

    expect(studentRepoFindOne).toHaveBeenCalledWith({
      where: { courseId: 7, user: { githubId: 'ada-lovelace' } },
      relations: ['user', 'course', 'course.discipline'],
    });
    expect(payload).toMatchObject({
      courseId: 7,
      courseName: 'Course X',
      coursePrimarySkill: 'Frontend',
      certificateIssuer: 'RS School',
      studentId: 42,
      studentName: 'Ada Lovelace',
    });
    expect(cloudApi.requestCertificate).toHaveBeenCalledWith(payload);
  });

  it('falls back to primarySkillName when discipline is missing', async () => {
    studentRepoFindOne.mockResolvedValue({ ...studentRow, course: { ...studentRow.course, discipline: null } });

    const payload = await service.requestCertificateIssuance(7, 'ada-lovelace');

    expect(payload.coursePrimarySkill).toBe('JS');
  });
});
