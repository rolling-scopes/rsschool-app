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

describe('CertificationsService.requestBulkCertificateIssuance', () => {
  const course = { id: 7, name: 'Course X', certificateIssuer: 'RS School', primarySkillName: 'JS', discipline: null };
  let courseRepoFindOne: ReturnType<typeof vi.fn>;
  let cloudApi: { requestCertificate: ReturnType<typeof vi.fn> };
  let service: CertificationsService;

  beforeEach(async () => {
    courseRepoFindOne = vi.fn();
    cloudApi = {
      requestCertificate: vi.fn().mockResolvedValue({}),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CertificationsService,
        { provide: getRepositoryToken(Certificate), useValue: {} },
        { provide: getRepositoryToken(Course), useValue: { findOne: courseRepoFindOne } },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: ConfigService, useValue: { awsClient: {} } },
        { provide: HttpService, useValue: {} },
        { provide: CloudApiService, useValue: cloudApi },
      ],
    }).compile();

    service = moduleRef.get(CertificationsService);
  });

  it('returns zero and skips cloud API when no students match', async () => {
    vi.spyOn(service, 'findEligibleStudents').mockResolvedValue([]);

    const result = await service.requestBulkCertificateIssuance(7, { minTotalScore: 100 });

    expect(result).toEqual({ issued: 0, students: [] });
    expect(cloudApi.requestCertificate).not.toHaveBeenCalled();
  });

  it('sends a batch payload when students match', async () => {
    vi.spyOn(service, 'findEligibleStudents').mockResolvedValue([
      { studentId: 1, githubId: 'ada', name: 'Ada Lovelace', totalScore: 95 },
      { studentId: 2, githubId: 'grace', name: 'Grace Hopper', totalScore: 88 },
    ]);
    courseRepoFindOne.mockResolvedValue(course);

    const result = await service.requestBulkCertificateIssuance(7, { minTotalScore: 80 });

    expect(result.issued).toBe(2);
    expect(cloudApi.requestCertificate).toHaveBeenCalledOnce();
    const payloads = cloudApi.requestCertificate.mock.calls[0]![0];
    expect(payloads).toHaveLength(2);
    expect(payloads[0]).toMatchObject({
      courseId: 7,
      courseName: 'Course X',
      studentId: 1,
      studentName: 'Ada Lovelace',
    });
  });

  it('throws when course is missing', async () => {
    vi.spyOn(service, 'findEligibleStudents').mockResolvedValue([
      { studentId: 1, githubId: 'ada', name: 'Ada', totalScore: 95 },
    ]);
    courseRepoFindOne.mockResolvedValue(null);

    await expect(service.requestBulkCertificateIssuance(999, { minTotalScore: 80 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(cloudApi.requestCertificate).not.toHaveBeenCalled();
  });
});
