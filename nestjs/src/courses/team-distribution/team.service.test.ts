import type { Mocked } from 'vitest';
import { Student, Team, TeamDistributionStudent } from '@entities/index';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TeamService } from './team.service';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { UpdateTeamDto } from './dto';

const buildStudent = (data: Partial<Student> = {}): Student => {
  return { id: 1, rank: 1, ...data } as Student;
};

const buildTeam = (data: Partial<Team> = {}): Team => {
  return { id: 1, students: [], teamLeadId: undefined, teamDistributionId: 1, ...data } as Team;
};

// Fluent createQueryBuilder mock. Terminal methods are configured per-test.
function buildQueryBuilder() {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of [
    'where',
    'andWhere',
    'leftJoin',
    'leftJoinAndSelect',
    'addSelect',
    'select',
    'orderBy',
    'take',
    'skip',
  ]) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getRawOne = vi.fn();
  qb.getOneOrFail = vi.fn();
  qb.getMany = vi.fn();
  qb.getManyAndCount = vi.fn();
  return qb;
}

function buildQueryRunner() {
  const manager = {
    save: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
  };
  return {
    manager,
    connect: vi.fn().mockResolvedValue(undefined),
    startTransaction: vi.fn().mockResolvedValue(undefined),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    rollbackTransaction: vi.fn().mockResolvedValue(undefined),
    release: vi.fn().mockResolvedValue(undefined),
  };
}

describe('TeamService', () => {
  let service: TeamService;
  let repository: Mocked<Repository<Team>>;
  let teamDistributionStudentService: Mocked<TeamDistributionStudentService>;
  let dataSource: Mocked<DataSource>;
  let queryRunner: ReturnType<typeof buildQueryRunner>;
  let qb: ReturnType<typeof buildQueryBuilder>;

  beforeEach(async () => {
    queryRunner = buildQueryRunner();
    qb = buildQueryBuilder();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: getRepositoryToken(Team),
          useValue: {
            save: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
            findOneOrFail: vi.fn(),
            createQueryBuilder: vi.fn(() => qb),
          },
        },
        {
          provide: TeamDistributionStudentService,
          useValue: {
            getStudentsForTeamByManager: vi.fn(),
            findByStudentIds: vi.fn(),
            saveTeamDistributionStudents: vi.fn(),
            getTeamDistributionStudent: vi.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: vi.fn(() => queryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    repository = module.get(getRepositoryToken(Team));
    teamDistributionStudentService = module.get(TeamDistributionStudentService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePassword', () => {
    it('should generate a password of the default length', async () => {
      const password = await service.generatePassword();

      expect(password).toHaveLength(6);
      expect(password).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate a password of the requested length', async () => {
      const password = await service.generatePassword(10);

      expect(password).toHaveLength(10);
    });
  });

  describe('create', () => {
    it('should assign the lowest-rank student as lead and save with a generated password', async () => {
      const data: Partial<Team> = {
        name: 'Team A',
        students: [buildStudent({ id: 1, rank: 3 }), buildStudent({ id: 2, rank: 1 })],
      };
      repository.save.mockResolvedValueOnce(buildTeam());

      await service.create(data);

      const saved = repository.save.mock.calls[0][0] as Partial<Team>;
      expect(saved.teamLeadId).toBe(2);
      expect(saved.password).toHaveLength(6);
    });

    it('should not set teamLeadId when there are no students', async () => {
      const data: Partial<Team> = { name: 'Empty', students: [] };
      repository.save.mockResolvedValueOnce(buildTeam());

      await service.create(data);

      const saved = repository.save.mock.calls[0][0] as Partial<Team>;
      expect(saved.teamLeadId).toBeUndefined();
      expect(saved.password).toHaveLength(6);
    });

    it('should not set teamLeadId when students is undefined', async () => {
      repository.save.mockResolvedValueOnce(buildTeam());

      await service.create({ name: 'NoStudents' });

      const saved = repository.save.mock.calls[0][0] as Partial<Team>;
      expect(saved.teamLeadId).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delegate to repository.delete', async () => {
      repository.delete.mockResolvedValueOnce({ affected: 1 } as never);

      await service.remove(5);

      expect(repository.delete).toHaveBeenCalledWith(5);
    });
  });

  describe('editTeamSquad', () => {
    it('should flag added students distributed/active and removed students not-distributed', async () => {
      const team = buildTeam({
        id: 1,
        teamLeadId: 1,
        students: [buildStudent({ id: 1, rank: 1 }), buildStudent({ id: 2, rank: 2 })],
      });
      // New squad: keep 1, drop 2, add 3.
      const studentIds = [1, 3];
      const newStudents = [buildStudent({ id: 1, rank: 1 }), buildStudent({ id: 3, rank: 5 })];
      teamDistributionStudentService.getStudentsForTeamByManager.mockResolvedValueOnce(newStudents);

      teamDistributionStudentService.findByStudentIds.mockResolvedValueOnce([
        { id: 20, studentId: 2 } as TeamDistributionStudent,
        { id: 30, studentId: 3 } as TeamDistributionStudent,
      ]);
      teamDistributionStudentService.saveTeamDistributionStudents.mockResolvedValueOnce([]);

      const result = await service.editTeamSquad(team, studentIds, 7, 9);

      expect(teamDistributionStudentService.getStudentsForTeamByManager).toHaveBeenCalledWith([1, 3], 7, 9, 1);
      // findByStudentIds receives [removed..., added...] => [2, 3].
      expect(teamDistributionStudentService.findByStudentIds).toHaveBeenCalledWith([2, 3], 7);

      const saved = teamDistributionStudentService.saveTeamDistributionStudents.mock
        .calls[0][0] as TeamDistributionStudent[];
      expect(saved).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ studentId: 2, distributed: false }),
          expect.objectContaining({ studentId: 3, distributed: true, active: true }),
        ]),
      );
      // teamLead (id 1) stays since it is not in the removed set.
      expect(result.teamLeadId).toBe(1);
      expect(result.students).toBe(newStudents);
    });

    it('should pick a new lead from new students when the current lead is removed', async () => {
      const team = buildTeam({
        id: 1,
        teamLeadId: 2,
        students: [buildStudent({ id: 2, rank: 1 })],
      });
      const studentIds = [3, 4];
      const newStudents = [buildStudent({ id: 3, rank: 5 }), buildStudent({ id: 4, rank: 2 })];
      teamDistributionStudentService.getStudentsForTeamByManager.mockResolvedValueOnce(newStudents);
      teamDistributionStudentService.findByStudentIds.mockResolvedValueOnce([
        { id: 20, studentId: 2 } as TeamDistributionStudent,
        { id: 30, studentId: 3 } as TeamDistributionStudent,
        { id: 40, studentId: 4 } as TeamDistributionStudent,
      ]);
      teamDistributionStudentService.saveTeamDistributionStudents.mockResolvedValueOnce([]);

      const result = await service.editTeamSquad(team, studentIds, 7, 9);

      // Lead becomes the lowest-rank new student (id 4 with rank 2).
      expect(result.teamLeadId).toBe(4);
    });

    it('should fall back to the existing lead when removed and there are no new students', async () => {
      const team = buildTeam({ id: 1, teamLeadId: 2, students: [buildStudent({ id: 2, rank: 1 })] });
      teamDistributionStudentService.getStudentsForTeamByManager.mockResolvedValueOnce([]);
      teamDistributionStudentService.findByStudentIds.mockResolvedValueOnce([
        { id: 20, studentId: 2 } as TeamDistributionStudent,
      ]);
      teamDistributionStudentService.saveTeamDistributionStudents.mockResolvedValueOnce([]);

      const result = await service.editTeamSquad(team, [], 7, 9);

      // No replacement candidate -> keep original teamLeadId.
      expect(result.teamLeadId).toBe(2);
    });

    // LATENT BUG: when studentIds is null/undefined the method throws.
    // Line 40 guards getStudentsForTeamByManager with `studentIds ?? []`, but line 50
    // computes `distributedStudentIds = studentIds?.filter(...)` which is `undefined`
    // when studentIds is nullish; spreading it on line 53 throws
    // "distributedStudentIds is not iterable". This test pins the current behavior.
    it('throws when studentIds is null (latent bug: undefined spread)', async () => {
      const team = buildTeam({
        id: 1,
        teamLeadId: 1,
        students: [buildStudent({ id: 1, rank: 1 })],
      });
      teamDistributionStudentService.getStudentsForTeamByManager.mockResolvedValueOnce([]);

      await expect(service.editTeamSquad(team, null as unknown as number[], 7, 9)).rejects.toThrow(
        'distributedStudentIds is not iterable',
      );

      // The first collaborator was still called with the guarded empty list before the throw.
      expect(teamDistributionStudentService.getStudentsForTeamByManager).toHaveBeenCalledWith([], 7, 9, 1);
    });
  });

  describe('findById', () => {
    it('should fetch the team with its relations', async () => {
      const team = buildTeam();
      repository.findOneOrFail.mockResolvedValueOnce(team);

      const result = await service.findById(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['students', 'teamDistribution'],
      });
      expect(result).toBe(team);
    });
  });

  describe('getStudentsCountInTeam', () => {
    it('should return the numeric count of students', async () => {
      qb.getRawOne.mockResolvedValueOnce({ studentsCount: '4' });

      const result = await service.getStudentsCountInTeam(1);

      expect(result).toBe(4);
      expect(qb.where).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('findTeamWithStudentsById', () => {
    it('should build the query and return the loaded team', async () => {
      const team = buildTeam();
      qb.getOneOrFail.mockResolvedValueOnce(team);

      const result = await service.findTeamWithStudentsById(1);

      expect(qb.where).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(team);
    });
  });

  describe('save', () => {
    it('should edit the squad when studentIds differ from the current team', async () => {
      const team = buildTeam({ id: 1, teamLeadId: 1, students: [buildStudent({ id: 1, rank: 1 })] });
      repository.findOneOrFail.mockResolvedValueOnce(team);
      const editSpy = vi
        .spyOn(service, 'editTeamSquad')
        .mockResolvedValueOnce({ students: [buildStudent({ id: 2, rank: 1 })], teamLeadId: 2 });
      repository.save.mockResolvedValueOnce(buildTeam());

      const dto = { studentIds: [2], name: 'X' } as UpdateTeamDto;
      await service.save(1, dto, 7, 9);

      expect(editSpy).toHaveBeenCalledWith(team, [2], 7, 9);
      const saved = repository.save.mock.calls[0][0] as Team;
      expect(saved.teamLeadId).toBe(2);
      expect(saved.students.map(s => s.id)).toEqual([2]);
    });

    it('should not edit the squad when studentIds match the current team', async () => {
      const team = buildTeam({ id: 1, teamLeadId: 1, students: [buildStudent({ id: 1, rank: 1 })] });
      repository.findOneOrFail.mockResolvedValueOnce(team);
      const editSpy = vi.spyOn(service, 'editTeamSquad');
      repository.save.mockResolvedValueOnce(buildTeam());

      await service.save(1, { studentIds: [1], name: 'X' } as UpdateTeamDto, 7, 9);

      expect(editSpy).not.toHaveBeenCalled();
    });

    it('should not edit the squad when studentIds is omitted', async () => {
      const team = buildTeam({ id: 1, students: [buildStudent({ id: 1, rank: 1 })] });
      repository.findOneOrFail.mockResolvedValueOnce(team);
      const editSpy = vi.spyOn(service, 'editTeamSquad');
      repository.save.mockResolvedValueOnce(buildTeam());

      await service.save(1, { name: 'X' } as UpdateTeamDto, 7, 9);

      expect(editSpy).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should delegate to repository.update', async () => {
      const dto = { name: 'Renamed' } as UpdateTeamDto;
      repository.update.mockResolvedValueOnce({ affected: 1 } as never);

      await service.update(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updatePassword', () => {
    it('should update only the password column', async () => {
      repository.update.mockResolvedValueOnce({ affected: 1 } as never);

      await service.updatePassword(1, 'secret');

      expect(repository.update).toHaveBeenCalledWith(1, { password: 'secret' });
    });
  });

  describe('findAllByDistributionId', () => {
    it('should return all teams for the distribution', async () => {
      const teams = [buildTeam()];
      qb.getMany.mockResolvedValueOnce(teams);

      const result = await service.findAllByDistributionId(1);

      expect(qb.where).toHaveBeenCalledWith('team."teamDistributionId" = :distributionId', { distributionId: 1 });
      expect(result).toBe(teams);
    });
  });

  describe('getCountByDistributionId', () => {
    it('should count teams for the distribution', async () => {
      repository.count.mockResolvedValueOnce(3);

      const result = await service.getCountByDistributionId(1);

      expect(repository.count).toHaveBeenCalledWith({ where: { teamDistributionId: 1 } });
      expect(result).toBe(3);
    });
  });

  describe('findByDistributionId', () => {
    it('should paginate without a search filter', async () => {
      qb.getManyAndCount.mockResolvedValueOnce([[buildTeam()], 1]);

      const result = await service.findByDistributionId(1, { page: 1, limit: 10 });

      // The "1=1" no-op filter is applied when there is no search term.
      expect(qb.andWhere).toHaveBeenCalledWith('1=1', { matchingTeamIds: [] });
      expect(result.teams).toHaveLength(1);
      expect(result.paginationMeta.total).toBe(1);
    });

    it('should pre-filter by matching team ids when a search term is provided', async () => {
      // First query (matching team ids) -> getMany; second (page) -> getManyAndCount.
      qb.getMany.mockResolvedValueOnce([{ id: 11 }, { id: 12 }] as Team[]);
      qb.getManyAndCount.mockResolvedValueOnce([[buildTeam({ id: 11 })], 1]);

      // Execute the Brackets factory so the inner search-condition builder runs.
      const innerQb = { where: vi.fn(() => innerQb), orWhere: vi.fn(() => innerQb) };
      qb.andWhere.mockImplementation((arg: unknown) => {
        if (arg && typeof arg === 'object' && 'whereFactory' in arg) {
          (arg as { whereFactory: (b: typeof innerQb) => void }).whereFactory(innerQb);
        }
        return qb;
      });

      const result = await service.findByDistributionId(1, { search: 'john', page: 1, limit: 10 });

      expect(qb.andWhere).toHaveBeenCalledWith('team.id IN (:...matchingTeamIds)', { matchingTeamIds: [11, 12] });
      // The Brackets condition assembled the ilike search string and discord/name clauses.
      expect(innerQb.where).toHaveBeenCalledWith(expect.stringContaining('ilike :search'), { search: 'john%' });
      expect(innerQb.orWhere).toHaveBeenCalledWith(expect.stringContaining('discord'), { search: 'john%' });
      expect(innerQb.orWhere).toHaveBeenCalledWith(expect.stringContaining('team.name'), { search: 'john%' });
      expect(result.teams).toHaveLength(1);
    });

    it('should fall back to default page and limit values', async () => {
      qb.getManyAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.findByDistributionId(1, {});

      expect(qb.take).toHaveBeenCalledWith(10);
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(result.paginationMeta.current).toBe(1);
    });
  });

  describe('deleteStudentFromTeam', () => {
    it('should remove the student and keep the existing lead when it is someone else', async () => {
      const team = buildTeam({
        id: 1,
        teamLeadId: 1,
        students: [buildStudent({ id: 1, rank: 1 }), buildStudent({ id: 2, rank: 2 })],
      });
      qb.getOneOrFail.mockResolvedValueOnce(team);
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValueOnce({
        id: 99,
      } as TeamDistributionStudent);

      await service.deleteStudentFromTeam(1, 2, 5);

      // Student 2 dropped, lead (1) preserved.
      expect(team.students.map(s => s.id)).toEqual([1]);
      expect(team.teamLeadId).toBe(1);
      expect(queryRunner.manager.save).toHaveBeenCalledWith(team);
      expect(queryRunner.manager.update).toHaveBeenCalledWith(TeamDistributionStudent, 99, { distributed: false });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should reassign the lead to the lowest-rank remaining student when the lead is removed', async () => {
      const team = buildTeam({
        id: 1,
        teamLeadId: 1,
        students: [
          buildStudent({ id: 1, rank: 1 }),
          buildStudent({ id: 2, rank: 4 }),
          buildStudent({ id: 3, rank: 2 }),
        ],
      });
      qb.getOneOrFail.mockResolvedValueOnce(team);
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValueOnce({
        id: 99,
      } as TeamDistributionStudent);

      await service.deleteStudentFromTeam(1, 1, 5);

      // Lead recomputed from remaining (id 3 has rank 2).
      expect(team.teamLeadId).toBe(3);
    });

    it('should set teamLeadId to 0 when the removed lead was the last student', async () => {
      const team = buildTeam({ id: 1, teamLeadId: 1, students: [buildStudent({ id: 1, rank: 1 })] });
      qb.getOneOrFail.mockResolvedValueOnce(team);
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValueOnce({
        id: 99,
      } as TeamDistributionStudent);

      await service.deleteStudentFromTeam(1, 1, 5);

      expect(team.students).toHaveLength(0);
      expect(team.teamLeadId).toBe(0);
    });

    it('should roll back and throw InternalServerErrorException on transaction failure', async () => {
      const team = buildTeam({ id: 1, teamLeadId: 1, students: [buildStudent({ id: 1, rank: 1 })] });
      qb.getOneOrFail.mockResolvedValueOnce(team);
      queryRunner.manager.save.mockRejectedValueOnce(new Error('db down'));

      await expect(service.deleteStudentFromTeam(1, 1, 5)).rejects.toBeInstanceOf(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('addStudentToTeam', () => {
    it('should add the student and mark the registration distributed', async () => {
      const team = buildTeam({ id: 1, students: [buildStudent({ id: 1, rank: 1 })] });
      const student = buildStudent({ id: 2, rank: 2 });
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValueOnce({
        id: 77,
      } as TeamDistributionStudent);

      await service.addStudentToTeam(team, student, 5);

      expect(team.students.map(s => s.id)).toEqual([1, 2]);
      expect(queryRunner.manager.save).toHaveBeenCalledWith(team);
      expect(queryRunner.manager.update).toHaveBeenCalledWith(TeamDistributionStudent, 77, { distributed: true });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should roll back and throw InternalServerErrorException on transaction failure', async () => {
      const team = buildTeam({ id: 1, students: [] });
      const student = buildStudent({ id: 2, rank: 2 });
      queryRunner.manager.save.mockRejectedValueOnce(new Error('db down'));

      await expect(service.addStudentToTeam(team, student, 5)).rejects.toBeInstanceOf(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('getTeamsAvailableForDistribute', () => {
    it('should return non-full teams sorted by ascending student count', async () => {
      const fullTeam = buildTeam({
        id: 1,
        students: [buildStudent({ id: 1 }), buildStudent({ id: 2 })],
      });
      const oneStudentTeam = buildTeam({ id: 2, students: [buildStudent({ id: 3 })] });
      const emptyTeam = buildTeam({ id: 3, students: [] });
      qb.getMany.mockResolvedValueOnce([fullTeam, oneStudentTeam, emptyTeam]);

      const result = await service.getTeamsAvailableForDistribute(1, 2);

      // Full team (length 2 === teamSize) is filtered out; remaining sorted by length ASC.
      expect(result.map(t => t.id)).toEqual([3, 2]);
    });

    it('should return an empty list when every team is full', async () => {
      const fullTeam = buildTeam({ id: 1, students: [buildStudent({ id: 1 }), buildStudent({ id: 2 })] });
      qb.getMany.mockResolvedValueOnce([fullTeam]);

      const result = await service.getTeamsAvailableForDistribute(1, 2);

      expect(result).toEqual([]);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(dataSource.createQueryRunner).toBeDefined();
  });
});
