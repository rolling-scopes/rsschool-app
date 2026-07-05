import type { Mocked } from 'vitest';
import { Student } from '@entities/student';
import { TeamDistribution } from '@entities/teamDistribution';
import { TeamDistributionStudent } from '@entities/teamDistributionStudent';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as paginateModule from 'src/core/paginate';
import { TeamDistributionStudentService } from './team-distribution-student.service';

// Fluent createQueryBuilder mock: every chainable builder method returns the
// builder; terminals are configured per test.
function buildQueryBuilder() {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of [
    'leftJoin',
    'innerJoin',
    'leftJoinAndSelect',
    'addSelect',
    'select',
    'where',
    'andWhere',
    'orWhere',
    'orderBy',
    'take',
    'skip',
  ]) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getManyAndCount = vi.fn();
  return qb;
}

const buildStudent = (data: Partial<Student> = {}): Student =>
  ({ id: 1, totalScore: 100, teams: [], ...data }) as Student;

const buildDistribution = (data: Partial<TeamDistribution> = {}): TeamDistribution =>
  ({
    id: 1,
    courseId: 2,
    startDate: new Date('2026-01-01T10:00:00.000Z'),
    endDate: new Date('2026-01-01T12:00:00.000Z'),
    minTotalScore: 100,
    strictTeamSize: 3,
    ...data,
  }) as TeamDistribution;

const buildTds = (data: Partial<TeamDistributionStudent> = {}): TeamDistributionStudent =>
  ({
    id: 1,
    studentId: 1,
    courseId: 2,
    teamDistributionId: 1,
    active: true,
    distributed: false,
    ...data,
  }) as TeamDistributionStudent;

describe('TeamDistributionStudentService', () => {
  let service: TeamDistributionStudentService;
  let repository: Mocked<Repository<TeamDistributionStudent>>;
  let studentRepository: Mocked<Repository<Student>>;
  let teamDistributionRepository: Mocked<Repository<TeamDistribution>>;
  let qb: ReturnType<typeof buildQueryBuilder>;

  const distribution = buildDistribution();

  beforeEach(async () => {
    qb = buildQueryBuilder();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamDistributionStudentService,
        {
          provide: getRepositoryToken(TeamDistributionStudent),
          useValue: {
            find: vi.fn(),
            findOne: vi.fn(),
            findOneOrFail: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {
            find: vi.fn(),
            findOneOrFail: vi.fn(),
            createQueryBuilder: vi.fn(() => qb),
          },
        },
        {
          provide: getRepositoryToken(TeamDistribution),
          useValue: {
            findOneOrFail: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TeamDistributionStudentService);
    repository = module.get(getRepositoryToken(TeamDistributionStudent));
    studentRepository = module.get(getRepositoryToken(Student));
    teamDistributionRepository = module.get(getRepositoryToken(TeamDistribution));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getTeamDistributionStudent', () => {
    it('loads the record without the student relation by default', async () => {
      const record = buildTds();
      repository.findOneOrFail.mockResolvedValue(record);

      const result = await service.getTeamDistributionStudent(1, 2);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { studentId: 1, teamDistributionId: 2 },
        relations: [],
      });
      expect(result).toBe(record);
    });

    it('loads the student relation when withStudentData is true', async () => {
      repository.findOneOrFail.mockResolvedValue(buildTds());

      await service.getTeamDistributionStudent(1, 2, true);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { studentId: 1, teamDistributionId: 2 },
        relations: ['student'],
      });
    });
  });

  describe('getStudentsForTeamByManager', () => {
    const studentIds = [1, 2];

    it('throws BadRequestException when no students are found', async () => {
      studentRepository.find.mockResolvedValue([]);

      await expect(service.getStudentsForTeamByManager(studentIds, 1, 2)).rejects.toThrow(BadRequestException);
      expect(teamDistributionRepository.findOneOrFail).not.toHaveBeenCalled();
    });

    it('throws when the number of students exceeds the strict team size', async () => {
      studentRepository.find.mockResolvedValue([buildStudent({ id: 1 }), buildStudent({ id: 2 })]);
      teamDistributionRepository.findOneOrFail.mockResolvedValue(buildDistribution({ strictTeamSize: 1 }));

      await expect(service.getStudentsForTeamByManager(studentIds, 1, 2)).rejects.toThrow(
        'The number of students in the team has been exceeded.',
      );
    });

    it('throws when a student is already on a team for this distribution', async () => {
      const students = [buildStudent({ id: 1, teams: [{ id: 5, teamDistributionId: 1 } as never] })];
      studentRepository.find.mockResolvedValue(students);
      teamDistributionRepository.findOneOrFail.mockResolvedValue(buildDistribution({ strictTeamSize: 3 }));

      await expect(service.getStudentsForTeamByManager([1], 1, 2)).rejects.toThrow(
        'One of the students is already on the team for the current distribution',
      );
    });

    it('ignores the current team when teamId matches (edit case)', async () => {
      const students = [buildStudent({ id: 1, teams: [{ id: 5, teamDistributionId: 1 } as never] })];
      studentRepository.find.mockResolvedValue(students);
      teamDistributionRepository.findOneOrFail.mockResolvedValue(buildDistribution({ strictTeamSize: 3 }));
      repository.find.mockResolvedValue([buildTds({ studentId: 1 })]);

      const result = await service.getStudentsForTeamByManager([1], 1, 2, 5);

      expect(result).toBe(students);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('registers students that are not yet registered before returning', async () => {
      const students = [buildStudent({ id: 1 }), buildStudent({ id: 2 })];
      studentRepository.find.mockResolvedValue(students);
      teamDistributionRepository.findOneOrFail.mockResolvedValue(buildDistribution({ strictTeamSize: 3 }));
      // only student 1 is registered -> student 2 must be added
      repository.find.mockResolvedValue([buildTds({ studentId: 1 })]);
      repository.save.mockResolvedValue([] as never);

      const result = await service.getStudentsForTeamByManager([1, 2], 1, 2);

      expect(repository.save).toHaveBeenCalledWith([{ studentId: 2, teamDistributionId: 1, courseId: 2 }]);
      expect(result).toBe(students);
    });

    it('does not register anyone when every student is already registered', async () => {
      const students = [buildStudent({ id: 1 }), buildStudent({ id: 2 })];
      studentRepository.find.mockResolvedValue(students);
      teamDistributionRepository.findOneOrFail.mockResolvedValue(buildDistribution({ strictTeamSize: 3 }));
      repository.find.mockResolvedValue([buildTds({ studentId: 1 }), buildTds({ studentId: 2 })]);

      await service.getStudentsForTeamByManager([1, 2], 1, 2);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('getTeamDistributionStudents', () => {
    it('queries by course, student ids and distribution', async () => {
      const records = [buildTds()];
      repository.find.mockResolvedValue(records);

      const result = await service.getTeamDistributionStudents([1, 2], 3, 4);

      expect(repository.find).toHaveBeenCalledWith({
        where: { courseId: 4, studentId: In([1, 2]), teamDistributionId: 3 },
      });
      expect(result).toBe(records);
    });
  });

  describe('addStudentsToTeamDistribution', () => {
    it('saves a record per student id', async () => {
      repository.save.mockResolvedValue([] as never);

      await service.addStudentsToTeamDistribution([7, 8], 1, 2);

      expect(repository.save).toHaveBeenCalledWith([
        { studentId: 7, teamDistributionId: 1, courseId: 2 },
        { studentId: 8, teamDistributionId: 1, courseId: 2 },
      ]);
    });

    it('saves an empty array when there are no student ids', async () => {
      repository.save.mockResolvedValue([] as never);

      await service.addStudentsToTeamDistribution([], 1, 2);

      expect(repository.save).toHaveBeenCalledWith([]);
    });
  });

  describe('addStudentToTeamDistribution', () => {
    it('throws when adding a student outside the distribution period', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T09:00:00.000Z'));

      await expect(service.addStudentToTeamDistribution(10, distribution, 2)).rejects.toThrow(BadRequestException);
      expect(repository.findOne).not.toHaveBeenCalled();
    });

    it('throws when the current date is after the distribution period', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T13:00:00.000Z'));

      await expect(service.addStudentToTeamDistribution(10, distribution, 2)).rejects.toThrow(BadRequestException);
    });

    it('skips the period verification when withVerification is false', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T09:00:00.000Z'));
      repository.findOne.mockResolvedValue(null);
      studentRepository.findOneOrFail.mockResolvedValue(buildStudent({ totalScore: 0 }));
      repository.save.mockResolvedValue({} as never);

      await service.addStudentToTeamDistribution(10, distribution, 2, false);

      // No threshold check either when verification is disabled, even with score 0.
      expect(repository.save).toHaveBeenCalled();
    });

    it('saves a new record at the exact start date boundary', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));
      repository.findOne.mockResolvedValue(null);
      studentRepository.findOneOrFail.mockResolvedValue(buildStudent({ totalScore: 120 }));
      repository.save.mockResolvedValue({} as never);

      await service.addStudentToTeamDistribution(10, distribution, 2);

      expect(repository.save).toHaveBeenCalledWith({ studentId: 10, courseId: 2, teamDistributionId: 1 });
    });

    it('reactivates an existing inactive record instead of inserting', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));
      repository.findOne.mockResolvedValue(buildTds({ id: 55, active: false, distributed: false }));
      studentRepository.findOneOrFail.mockResolvedValue(buildStudent({ totalScore: 150 }));
      repository.update.mockResolvedValue({} as never);

      await service.addStudentToTeamDistribution(10, distribution, 2);

      expect(repository.update).toHaveBeenCalledWith(55, { active: true });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws when the existing record is already active', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));
      repository.findOne.mockResolvedValue(buildTds({ active: true, distributed: false }));

      await expect(service.addStudentToTeamDistribution(10, distribution, 2)).rejects.toThrow(BadRequestException);
      expect(studentRepository.findOneOrFail).not.toHaveBeenCalled();
    });

    it('throws when the existing record is already distributed', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));
      repository.findOne.mockResolvedValue(buildTds({ active: false, distributed: true }));

      await expect(service.addStudentToTeamDistribution(10, distribution, 2)).rejects.toThrow(BadRequestException);
    });

    it('throws when the student score is below the input threshold', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));
      repository.findOne.mockResolvedValue(null);
      studentRepository.findOneOrFail.mockResolvedValue(buildStudent({ totalScore: 99 }));

      await expect(service.addStudentToTeamDistribution(10, distribution, 2)).rejects.toThrow(
        'Number of points is less than the input threshold for distribution',
      );
    });

    it('uses the distribution courseId (not the argument) when saving a new record', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T11:00:00.000Z'));
      const dist = buildDistribution({ id: 9, courseId: 77, minTotalScore: 50 });
      repository.findOne.mockResolvedValue(null);
      studentRepository.findOneOrFail.mockResolvedValue(buildStudent({ totalScore: 60 }));
      repository.save.mockResolvedValue({} as never);

      await service.addStudentToTeamDistribution(10, dist, 2);

      expect(repository.save).toHaveBeenCalledWith({ studentId: 10, courseId: 77, teamDistributionId: 9 });
    });
  });

  describe('deleteStudentFromTeamDistribution', () => {
    it('marks the record as inactive', async () => {
      repository.findOne.mockResolvedValue(buildTds({ id: 33 }));
      repository.update.mockResolvedValue({} as never);

      await service.deleteStudentFromTeamDistribution(10, 1);

      expect(repository.update).toHaveBeenCalledWith(33, { active: false });
    });

    it('throws NotFoundException when the record does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.deleteStudentFromTeamDistribution(10, 1)).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('markStudentAsDistributed', () => {
    it('marks the record as distributed', async () => {
      repository.findOne.mockResolvedValue(buildTds({ id: 44 }));
      repository.update.mockResolvedValue({} as never);

      await service.markStudentAsDistributed(10, 1);

      expect(repository.update).toHaveBeenCalledWith(44, { distributed: true });
    });

    it('throws NotFoundException when the record does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.markStudentAsDistributed(10, 1)).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('findByStudentIds', () => {
    it('finds records by student ids and distribution', async () => {
      const records = [buildTds()];
      repository.find.mockResolvedValue(records);

      const result = await service.findByStudentIds([1, 2], 7);

      expect(repository.find).toHaveBeenCalledWith({
        where: { studentId: In([1, 2]), teamDistributionId: 7 },
      });
      expect(result).toBe(records);
    });
  });

  describe('saveTeamDistributionStudents', () => {
    it('delegates to the repository save', async () => {
      const records = [buildTds()];
      repository.save.mockResolvedValue(records as never);

      const result = await service.saveTeamDistributionStudents(records);

      expect(repository.save).toHaveBeenCalledWith(records);
      expect(result).toBe(records);
    });
  });

  describe('getStudentsByTeamDistributionId', () => {
    it('paginates without a search filter and orders by rank', async () => {
      const students = [buildStudent({ id: 1 })];
      const paginateSpy = vi.spyOn(paginateModule, 'paginate').mockResolvedValue({
        items: students,
        meta: { itemCount: 1, total: 1, current: 1, pageSize: 10, totalPages: 1 },
      } as never);

      const result = await service.getStudentsByTeamDistributionId(5, {});

      expect(qb.where).toHaveBeenCalledWith('tds.teamDistributionId = :teamDistributionId', { teamDistributionId: 5 });
      expect(qb.andWhere).toHaveBeenCalledWith('tds.active = true');
      expect(qb.andWhere).toHaveBeenCalledWith('tds.distributed = false');
      expect(qb.orderBy).toHaveBeenCalledWith('student.rank', 'ASC');
      expect(paginateSpy).toHaveBeenCalledWith(qb, { page: 1, limit: 10 });
      expect(result.students).toBe(students);
      expect(result.paginationMeta).toEqual({ itemCount: 1, total: 1, current: 1, pageSize: 10, totalPages: 1 });
    });

    it('applies search conditions when a search string is provided', async () => {
      vi.spyOn(paginateModule, 'paginate').mockResolvedValue({ items: [], meta: {} } as never);

      await service.getStudentsByTeamDistributionId(5, { search: 'john', page: 2, limit: 25 });

      // search branch adds a Brackets condition via andWhere; paginate receives the supplied page/limit
      const bracketsArg = qb.andWhere.mock.calls.map(c => c[0]).find(a => a && typeof a === 'object');
      expect(bracketsArg).toBeDefined();
      expect(paginateModule.paginate).toHaveBeenCalledWith(qb, { page: 2, limit: 25 });

      // Execute the Brackets factory to exercise getSearchString / getSearchConditions internals.
      const subQb = { where: vi.fn(() => subQb), orWhere: vi.fn(() => subQb) };
      (bracketsArg as { whereFactory: (qb: typeof subQb) => void }).whereFactory(subQb);
      expect(subQb.where).toHaveBeenCalledWith(expect.stringContaining('"user"."githubId" ilike :search'), {
        search: 'john%',
      });
      expect(subQb.orWhere).toHaveBeenCalledWith(`CAST(user.discord AS jsonb)->>'username' ILIKE :search`, {
        search: 'john%',
      });
    });
  });

  describe('getStudentWithRelations', () => {
    it('loads a student with the requested relations', async () => {
      const student = buildStudent();
      studentRepository.findOneOrFail.mockResolvedValue(student);

      const result = await service.getStudentWithRelations(1, { teams: true });

      expect(studentRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 }, relations: { teams: true } });
      expect(result).toBe(student);
    });
  });

  describe('getStudentsForDistribute', () => {
    it('loads active, non-distributed, non-expelled students ordered by rank desc', async () => {
      const records = [buildTds()];
      repository.find.mockResolvedValue(records);

      const result = await service.getStudentsForDistribute(9);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          teamDistributionId: 9,
          active: true,
          distributed: false,
          student: { isExpelled: false },
        },
        relations: { student: true },
        order: { student: { rank: 'DESC' } },
      });
      expect(result).toBe(records);
    });
  });
});
