import { Student } from '@entities/student';
import { TeamDistribution } from '@entities/teamDistribution';
import { TeamDistributionStudent } from '@entities/teamDistributionStudent';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamDistributionStudentService } from './team-distribution-student.service';

describe('TeamDistributionStudentService', () => {
  let service: TeamDistributionStudentService;

  const repository = {
    findOne: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };

  const studentRepository = {
    findOneOrFail: vi.fn(),
  };

  const teamDistributionRepository = {};

  const distribution: TeamDistribution = {
    id: 1,
    courseId: 2,
    startDate: new Date('2026-01-01T10:00:00.000Z'),
    endDate: new Date('2026-01-01T12:00:00.000Z'),
    minTotalScore: 100,
  } as TeamDistribution;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamDistributionStudentService,
        {
          provide: getRepositoryToken(TeamDistributionStudent),
          useValue: repository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentRepository,
        },
        {
          provide: getRepositoryToken(TeamDistribution),
          useValue: teamDistributionRepository,
        },
      ],
    }).compile();

    service = module.get<TeamDistributionStudentService>(TeamDistributionStudentService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throw when adding student outside distribution period', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T09:00:00.000Z'));

    await expect(service.addStudentToTeamDistribution(10, distribution, 2)).rejects.toThrow(BadRequestException);
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('should allow adding student exactly at start date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));

    repository.findOne.mockResolvedValueOnce(null);
    studentRepository.findOneOrFail.mockResolvedValueOnce({ totalScore: 120 } as Student);
    repository.save.mockResolvedValueOnce({});

    await service.addStudentToTeamDistribution(10, distribution, 2);

    expect(repository.save).toHaveBeenCalledWith({
      studentId: 10,
      courseId: 2,
      teamDistributionId: 1,
    });
  });

  it('should throw when student score is below threshold', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));

    repository.findOne.mockResolvedValueOnce(null);
    studentRepository.findOneOrFail.mockResolvedValueOnce({ totalScore: 99 } as Student);

    await expect(service.addStudentToTeamDistribution(10, distribution, 2)).rejects.toThrow(
      'less than the input threshold',
    );
  });
});
