import type { Mocked } from 'vitest';
import { Student } from '@entities/student';
import { TeamDistribution } from '@entities/teamDistribution';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamDistributionStudent } from '@entities/teamDistributionStudent';
import { Repository } from 'typeorm';
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

// Fluent createQueryBuilder mock whose getMany resolves the given rows.
function queryBuilderReturning(rows: unknown[]) {
  const qb: Record<string, unknown> = {};
  for (const m of ['leftJoinAndSelect', 'where', 'andWhere']) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getMany = vi.fn(async () => rows);
  return qb;
}

describe('TeamDistributionService', () => {
  let service: TeamDistributionService;
  let repository: Mocked<Repository<TeamDistribution>>;
  let teamDistributionStudentRepository: Mocked<Repository<TeamDistributionStudent>>;
  let teamService: Mocked<TeamService>;
  let writeScoreService: Mocked<WriteScoreService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamDistributionService,
        {
          provide: getRepositoryToken(TeamDistribution),
          useValue: {
            save: vi.fn(),
            find: vi.fn(),
            findOneOrFail: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(TeamDistributionStudent),
          useValue: {
            count: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
        {
          provide: TeamService,
          useValue: {
            getCountByDistributionId: vi.fn(),
            findAllByDistributionId: vi.fn(),
          },
        },
        {
          provide: WriteScoreService,
          useValue: {
            saveScore: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamDistributionService>(TeamDistributionService);
    repository = module.get(getRepositoryToken(TeamDistribution));
    teamDistributionStudentRepository = module.get(getRepositoryToken(TeamDistributionStudent));
    teamService = module.get(TeamService);
    writeScoreService = module.get(WriteScoreService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to repository.save and return the result', async () => {
      const data: Partial<TeamDistribution> = { courseId: 5, strictTeamSize: 4 };
      const saved = buildDistribution(data);
      repository.save.mockResolvedValueOnce(saved);

      const result = await service.create(data);

      expect(repository.save).toHaveBeenCalledWith(data);
      expect(result).toBe(saved);
    });
  });

  describe('addStatusToDistribution', () => {
    it('should mark distribution as unavailable when student is missing', () => {
      const distribution = buildDistribution();

      const result = service.addStatusToDistribution(distribution, null);

      expect(result.registrationStatus).toBe(registrationStatusEnum.Unavailable);
    });

    it('should mark distribution as unavailable when student is expelled', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));

      const distribution = buildDistribution();
      const student = buildStudent({ isExpelled: true });

      const result = service.addStatusToDistribution(distribution, student);

      expect(result.registrationStatus).toBe(registrationStatusEnum.Unavailable);
    });

    it('should mark distribution as unavailable when score is below minTotalScore', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));

      const distribution = buildDistribution({ minTotalScore: 200 });
      const student = buildStudent({ totalScore: 100 });

      const result = service.addStatusToDistribution(distribution, student);

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

    it('should ignore registrations belonging to other distributions', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));

      const distribution = buildDistribution();
      const student = buildStudent({
        teamDistributionStudents: [
          { teamDistributionId: 999, distributed: true, active: true },
        ] as Student['teamDistributionStudents'],
      });

      const result = service.addStatusToDistribution(distribution, student);

      expect(result.registrationStatus).toBe(registrationStatusEnum.Available);
    });

    it('should mark distribution as available at start-date boundary', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));

      const distribution = buildDistribution();
      const student = buildStudent();

      const result = service.addStatusToDistribution(distribution, student);

      expect(result.registrationStatus).toBe(registrationStatusEnum.Available);
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

    it('should keep distribution properties on the returned object', () => {
      const distribution = buildDistribution({ courseId: 7 });

      const result = service.addStatusToDistribution(distribution, null);

      expect(result).toMatchObject({ id: 1, courseId: 7 });
    });
  });

  describe('findByCourseId', () => {
    it('should query distributions for the course ordered by startDate ASC', async () => {
      const distributions = [buildDistribution()];
      repository.find.mockResolvedValueOnce(distributions);

      const result = await service.findByCourseId(42);

      expect(repository.find).toHaveBeenCalledWith({
        where: { courseId: 42 },
        order: { startDate: 'ASC' },
      });
      expect(result).toBe(distributions);
    });
  });

  describe('getById', () => {
    it('should delegate to repository.findOneOrFail', async () => {
      const distribution = buildDistribution();
      repository.findOneOrFail.mockResolvedValueOnce(distribution);

      const result = await service.getById(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(distribution);
    });

    it('should propagate errors from repository.findOneOrFail', async () => {
      repository.findOneOrFail.mockRejectedValueOnce(new Error('not found'));

      await expect(service.getById(1)).rejects.toThrow('not found');
    });
  });

  describe('getDistributionDetailedById', () => {
    it('should aggregate distribution, teams count and undistributed students count', async () => {
      const distribution = buildDistribution();
      repository.findOneOrFail.mockResolvedValueOnce(distribution);
      teamService.getCountByDistributionId.mockResolvedValueOnce(3);
      teamDistributionStudentRepository.count.mockResolvedValueOnce(5);

      const result = await service.getDistributionDetailedById(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(teamService.getCountByDistributionId).toHaveBeenCalledWith(1);
      expect(teamDistributionStudentRepository.count).toHaveBeenCalledWith({
        where: { teamDistributionId: 1, active: true, distributed: false },
      });
      expect(result).toEqual({
        teamDistribution: distribution,
        teamsCount: 3,
        studentsWithoutTeamCount: 5,
      });
    });
  });

  describe('update', () => {
    it('should delegate to repository.update', async () => {
      const updateResult = { affected: 1 } as never;
      repository.update.mockResolvedValueOnce(updateResult);

      const result = await service.update(1, { strictTeamSize: 6 });

      expect(repository.update).toHaveBeenCalledWith(1, { strictTeamSize: 6 });
      expect(result).toBe(updateResult);
    });
  });

  describe('remove', () => {
    it('should delegate to repository.delete', async () => {
      repository.delete.mockResolvedValueOnce({ affected: 1 } as never);

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('submitScore', () => {
    it('should copy the max team task score to every other team member', async () => {
      teamService.findAllByDistributionId.mockResolvedValueOnce([
        { id: 1, students: [{ id: 10 }, { id: 11 }, { id: 12 }] },
      ] as never);

      const studentsWithScore = [
        { studentId: 10, student: { taskResults: [{ studentId: 10, score: 5, comment: 'low' }] } },
        { studentId: 11, student: { taskResults: [{ studentId: 11, score: 9, comment: 'best' }] } },
      ];
      teamDistributionStudentRepository.createQueryBuilder.mockReturnValueOnce(
        queryBuilderReturning(studentsWithScore) as never,
      );

      await service.submitScore(1, 77);

      // Student 11 owns the max score; students 10 and 12 get the copied score.
      expect(writeScoreService.saveScore).toHaveBeenCalledTimes(2);
      expect(writeScoreService.saveScore).toHaveBeenCalledWith(10, 77, {
        score: 9,
        courseTaskId: 77,
        comment: 'best',
      });
      expect(writeScoreService.saveScore).toHaveBeenCalledWith(12, 77, {
        score: 9,
        courseTaskId: 77,
        comment: 'best',
      });
    });

    it('should default to score 0 and Cross-Check comment when no team member has a score', async () => {
      teamService.findAllByDistributionId.mockResolvedValueOnce([
        { id: 1, students: [{ id: 20 }, { id: 21 }] },
      ] as never);
      teamDistributionStudentRepository.createQueryBuilder.mockReturnValueOnce(queryBuilderReturning([]) as never);

      await service.submitScore(1, 88);

      expect(writeScoreService.saveScore).toHaveBeenCalledTimes(2);
      expect(writeScoreService.saveScore).toHaveBeenCalledWith(20, 88, {
        score: 0,
        courseTaskId: 88,
        comment: 'Cross-Check score',
      });
      expect(writeScoreService.saveScore).toHaveBeenCalledWith(21, 88, {
        score: 0,
        courseTaskId: 88,
        comment: 'Cross-Check score',
      });
    });

    it('should build the scored-students query with the expected joins and filters', async () => {
      teamService.findAllByDistributionId.mockResolvedValueOnce([]);
      const qb = queryBuilderReturning([]);
      teamDistributionStudentRepository.createQueryBuilder.mockReturnValueOnce(qb as never);

      await service.submitScore(3, 99);

      expect(teamDistributionStudentRepository.createQueryBuilder).toHaveBeenCalledWith('tds');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('tds.student', 'student');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('student.taskResults', 'tr');
      expect(qb.where).toHaveBeenCalledWith('tds.teamDistributionId = :teamDistributionId', {
        teamDistributionId: 3,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('tr.courseTaskId = :taskId', { taskId: 99 });
      expect(qb.andWhere).toHaveBeenCalledWith('tr.score > 0');
    });

    it('should do nothing when there are no teams', async () => {
      teamService.findAllByDistributionId.mockResolvedValueOnce([]);
      teamDistributionStudentRepository.createQueryBuilder.mockReturnValueOnce(queryBuilderReturning([]) as never);

      await service.submitScore(1, 5);

      expect(writeScoreService.saveScore).not.toHaveBeenCalled();
    });

    it('should not write scores for a single-student team that owns the max score', async () => {
      teamService.findAllByDistributionId.mockResolvedValueOnce([{ id: 1, students: [{ id: 30 }] }] as never);
      teamDistributionStudentRepository.createQueryBuilder.mockReturnValueOnce(
        queryBuilderReturning([
          { studentId: 30, student: { taskResults: [{ studentId: 30, score: 7, comment: 'solo' }] } },
        ]) as never,
      );

      await service.submitScore(1, 12);

      expect(writeScoreService.saveScore).not.toHaveBeenCalled();
    });
  });
});
