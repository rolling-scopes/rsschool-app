import { Student } from '@entities/student';
import { TeamDistribution } from '@entities/teamDistribution';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamDistributionStudent } from '@entities/teamDistributionStudent';
import { TeamDistributionService, registrationStatusEnum } from './team-distribution.service';
import { TeamService } from './team.service';
import { WriteScoreService } from '../score';

const buildDistribution = (data: Partial<TeamDistribution> = {}): TeamDistribution => {
  return {
    id: 1,
    startDate: new Date('2026-01-01T10:00:00.000Z'),
    endDate: new Date('2026-01-01T14:00:00.000Z'),
    minTotalScore: 0,
    ...data,
  } as TeamDistribution;
};

const buildStudent = (data: Partial<Student> = {}): Student => {
  return {
    id: 1,
    isExpelled: false,
    totalScore: 100,
    teamDistributionStudents: [],
    ...data,
  } as Student;
};

describe('TeamDistributionService', () => {
  let service: TeamDistributionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamDistributionService,
        { provide: getRepositoryToken(TeamDistribution), useValue: {} },
        { provide: getRepositoryToken(TeamDistributionStudent), useValue: {} },
        { provide: TeamService, useValue: {} },
        { provide: WriteScoreService, useValue: {} },
      ],
    }).compile();

    service = module.get<TeamDistributionService>(TeamDistributionService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should mark distribution as unavailable when student is missing', () => {
    const distribution = buildDistribution();

    const result = service.addStatusToDistribution(distribution, null);

    expect(result.registrationStatus).toBe(registrationStatusEnum.Unavailable);
  });

  it('should mark distribution as future before start date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T09:00:00.000Z'));

    const distribution = buildDistribution();
    const student = buildStudent();

    const result = service.addStatusToDistribution(distribution, student);

    expect(result.registrationStatus).toBe(registrationStatusEnum.Future);
  });

  it('should mark distribution as distributed for already distributed student', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));

    const distribution = buildDistribution();
    const student = buildStudent({
      teamDistributionStudents: [{ teamDistributionId: 1, distributed: true }] as Student['teamDistributionStudents'],
    });

    const result = service.addStatusToDistribution(distribution, student);

    expect(result.registrationStatus).toBe(registrationStatusEnum.Distributed);
  });

  it('should mark distribution as completed for active registration', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));

    const distribution = buildDistribution();
    const student = buildStudent({
      teamDistributionStudents: [{ teamDistributionId: 1, active: true }] as Student['teamDistributionStudents'],
    });

    const result = service.addStatusToDistribution(distribution, student);

    expect(result.registrationStatus).toBe(registrationStatusEnum.Completed);
  });

  it('should mark distribution as available at end-date boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T14:00:00.000Z'));

    const distribution = buildDistribution();
    const student = buildStudent();

    const result = service.addStatusToDistribution(distribution, student);

    expect(result.registrationStatus).toBe(registrationStatusEnum.Available);
  });

  it('should mark distribution as closed after end date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T14:00:01.000Z'));

    const distribution = buildDistribution();
    const student = buildStudent();

    const result = service.addStatusToDistribution(distribution, student);

    expect(result.registrationStatus).toBe(registrationStatusEnum.Closed);
  });
});
