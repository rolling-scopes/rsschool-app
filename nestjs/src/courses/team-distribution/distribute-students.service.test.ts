import type { Mocked } from 'vitest';
import { Student, Team, TeamDistributionStudent } from '@entities/index';
import { TeamDistribution } from '@entities/teamDistribution';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DistributeStudentsService } from './distribute-students.service';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { TeamService } from './team.service';

const buildStudent = (data: Partial<Student> = {}): Student => {
  return { id: 1, rank: 1, ...data } as Student;
};

const buildTeam = (data: Partial<Team> = {}): Team => {
  return { id: 1, students: [], teamDistributionId: 1, ...data } as Team;
};

const buildTds = (data: Partial<TeamDistributionStudent> = {}): TeamDistributionStudent => {
  return {
    id: 1,
    studentId: data.student?.id ?? 1,
    student: buildStudent(),
    teamDistributionId: 1,
    distributed: false,
    active: true,
    ...data,
  } as TeamDistributionStudent;
};

// A query-runner mock that records the manager calls. By default everything resolves.
function buildQueryRunner() {
  const manager = {
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };
  const queryRunner = {
    manager,
    connect: vi.fn().mockResolvedValue(undefined),
    startTransaction: vi.fn().mockResolvedValue(undefined),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    rollbackTransaction: vi.fn().mockResolvedValue(undefined),
    release: vi.fn().mockResolvedValue(undefined),
  };
  return queryRunner;
}

describe('DistributeStudentsService', () => {
  let service: DistributeStudentsService;
  let repository: Mocked<Repository<TeamDistribution>>;
  let teamDistributionStudentService: Mocked<TeamDistributionStudentService>;
  let teamService: Mocked<TeamService>;
  let dataSource: Mocked<DataSource>;
  let queryRunner: ReturnType<typeof buildQueryRunner>;

  beforeEach(async () => {
    queryRunner = buildQueryRunner();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributeStudentsService,
        {
          provide: getRepositoryToken(TeamDistribution),
          useValue: {
            findOneOrFail: vi.fn(),
          },
        },
        {
          provide: TeamDistributionStudentService,
          useValue: {
            getStudentsForDistribute: vi.fn(),
            getTeamDistributionStudents: vi.fn(),
          },
        },
        {
          provide: TeamService,
          useValue: {
            getTeamsAvailableForDistribute: vi.fn(),
            generatePassword: vi.fn(),
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

    service = module.get<DistributeStudentsService>(DistributeStudentsService);
    repository = module.get(getRepositoryToken(TeamDistribution));
    teamDistributionStudentService = module.get(TeamDistributionStudentService);
    teamService = module.get(TeamService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should delegate to repository.findOneOrFail', async () => {
      const distribution = { id: 1 } as TeamDistribution;
      repository.findOneOrFail.mockResolvedValueOnce(distribution);

      const result = await service.getById(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(distribution);
    });

    it('should propagate errors', async () => {
      repository.findOneOrFail.mockRejectedValueOnce(new Error('missing'));

      await expect(service.getById(1)).rejects.toThrow('missing');
    });
  });

  describe('distributeStudents', () => {
    const baseDistribution = { id: 1, strictTeamSize: 2, courseId: 9 } as TeamDistribution;

    it('should fill an existing team with capacity using available students', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(baseDistribution);

      // One team with a single student -> capacity = teamSize(2) - 1 = 1.
      // It is a "small team" (students.length <= 1) but capacity(1) is NOT > students(1),
      // so the small-team removal branch is skipped.
      const existingTeam = buildTeam({ id: 100, students: [buildStudent({ id: 1, rank: 1 })] });
      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([existingTeam]);

      const studentToPlace = buildTds({ id: 50, student: buildStudent({ id: 2, rank: 2 }) });
      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce([studentToPlace]) // first read
        .mockResolvedValueOnce([]); // after filling, no leftovers

      await service.distributeStudents(1);

      // modifyTeams is called once with the filled team and the distributed student flagged.
      expect(queryRunner.manager.save).toHaveBeenCalledWith(Team, [existingTeam]);
      expect(queryRunner.manager.save).toHaveBeenCalledWith(TeamDistributionStudent, [
        { ...studentToPlace, distributed: true },
      ]);
      expect(existingTeam.students.map(s => s.id)).toContain(2);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should remove small teams when there is enough capacity then create random teams', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(baseDistribution);

      // Two small teams, each with 1 student -> capacity = (2-1)+(2-1) = 2.
      // studentsWithoutTeam has 0 -> capacity(2) > 0 -> removal branch taken.
      const smallTeamA = buildTeam({ id: 100, students: [buildStudent({ id: 1, rank: 1 })] });
      const smallTeamB = buildTeam({ id: 101, students: [buildStudent({ id: 2, rank: 2 })] });

      teamService.getTeamsAvailableForDistribute
        .mockResolvedValueOnce([smallTeamA, smallTeamB]) // before removal
        .mockResolvedValueOnce([]); // after removal there are no teams left

      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce([]) // first read: no free students
        .mockResolvedValueOnce([buildTds({ id: 1, student: buildStudent({ id: 1, rank: 1 }) })]) // after removal
        .mockResolvedValueOnce([buildTds({ id: 1, student: buildStudent({ id: 1, rank: 1 }) })]); // before createRandomTeams

      teamDistributionStudentService.getTeamDistributionStudents.mockResolvedValueOnce([
        buildTds({ id: 1, distributed: true }),
        buildTds({ id: 2, distributed: true }),
      ]);

      teamService.generatePassword.mockResolvedValue('pw1234');

      await service.distributeStudents(1);

      // removeTeams calls getTeamDistributionStudents with flattened student ids.
      expect(teamDistributionStudentService.getTeamDistributionStudents).toHaveBeenCalledWith([1, 2], 1, 9);
      // The empty teams are removed in the transaction.
      expect(queryRunner.manager.remove).toHaveBeenCalledWith(
        Team,
        expect.arrayContaining([expect.objectContaining({ id: 100, students: [] })]),
      );
      // A random team gets created for the single leftover student.
      expect(teamService.generatePassword).toHaveBeenCalled();
    });

    it('should not remove small teams when capacity does not exceed students-without-team count', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(baseDistribution);

      const smallTeam = buildTeam({ id: 100, students: [buildStudent({ id: 1, rank: 1 })] });
      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([smallTeam]);

      // capacity = 1, studentsWithoutTeam.length = 1 -> 1 > 1 is false -> no removal.
      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce([buildTds({ id: 50, student: buildStudent({ id: 2, rank: 2 }) })])
        .mockResolvedValueOnce([]);

      await service.distributeStudents(1);

      expect(teamDistributionStudentService.getTeamDistributionStudents).not.toHaveBeenCalled();
      expect(queryRunner.manager.remove).not.toHaveBeenCalled();
    });

    it('should skip the fill step when total capacity is zero', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(baseDistribution);

      // A full team -> capacity 0. No small teams (length 2 > 1).
      const fullTeam = buildTeam({
        id: 100,
        students: [buildStudent({ id: 1, rank: 1 }), buildStudent({ id: 2, rank: 2 })],
      });
      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([fullTeam]);
      teamDistributionStudentService.getStudentsForDistribute.mockResolvedValueOnce([]);

      await service.distributeStudents(1);

      // No fill, no leftover students -> no transaction at all.
      expect(queryRunner.manager.save).not.toHaveBeenCalled();
      expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
    });

    it('should create random teams via snake-draft when no teams exist and students exceed team size', async () => {
      const distribution = { id: 1, strictTeamSize: 2, courseId: 9 } as TeamDistribution;
      repository.findOneOrFail.mockResolvedValueOnce(distribution);

      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([]); // no existing teams
      teamService.generatePassword.mockResolvedValue('pw0000');

      // 4 students, teamSize 2 -> neededTeams = 2 which is NOT < teamSize(2) -> snake draft.
      const students = [
        buildTds({ id: 1, student: buildStudent({ id: 1, rank: 1 }) }),
        buildTds({ id: 2, student: buildStudent({ id: 2, rank: 2 }) }),
        buildTds({ id: 3, student: buildStudent({ id: 3, rank: 3 }) }),
        buildTds({ id: 4, student: buildStudent({ id: 4, rank: 4 }) }),
      ];
      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce(students) // first read
        .mockResolvedValueOnce(students); // before createRandomTeams (capacity was 0)

      await service.distributeStudents(1);

      // Two passwords -> two teams created.
      expect(teamService.generatePassword).toHaveBeenCalledTimes(2);

      const savedTeams = queryRunner.manager.save.mock.calls.find(call => call[0] === Team)?.[1] as Team[];
      expect(savedTeams).toHaveLength(2);
      // Every student ends up assigned; total assigned equals 4.
      const assignedIds = savedTeams.flatMap(t => t.students.map(s => s.id)).sort();
      expect(assignedIds).toEqual([1, 2, 3, 4]);
      // Each team's lead is the lowest-rank member.
      for (const team of savedTeams) {
        const expectedLead = [...team.students].sort((a, b) => a.rank - b.rank)[0]?.id;
        expect((team as Team & { teamLeadId: number }).teamLeadId).toBe(expectedLead);
      }
      // All students flagged distributed.
      const savedStudents = queryRunner.manager.save.mock.calls.find(
        call => call[0] === TeamDistributionStudent,
      )?.[1] as TeamDistributionStudent[];
      expect(savedStudents.every(s => s.distributed)).toBe(true);
    });

    it('should assign students directly (no snake draft) when needed teams is fewer than team size', async () => {
      const distribution = { id: 1, strictTeamSize: 3, courseId: 9 } as TeamDistribution;
      repository.findOneOrFail.mockResolvedValueOnce(distribution);

      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([]);
      teamService.generatePassword.mockResolvedValue('pwAAAA');

      // 2 students, teamSize 3 -> neededTeams = ceil(2/3) = 1 < 3 -> direct assignment branch.
      const students = [
        buildTds({ id: 1, student: buildStudent({ id: 1, rank: 2 }) }),
        buildTds({ id: 2, student: buildStudent({ id: 2, rank: 1 }) }),
      ];
      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce(students)
        .mockResolvedValueOnce(students);

      await service.distributeStudents(1);

      expect(teamService.generatePassword).toHaveBeenCalledTimes(1);
      const savedTeams = queryRunner.manager.save.mock.calls.find(call => call[0] === Team)?.[1] as Team[];
      expect(savedTeams).toHaveLength(1);
      expect(savedTeams[0].students.map(s => s.id).sort()).toEqual([1, 2]);
      // Lead is the lowest-rank student (id 2 with rank 1).
      expect((savedTeams[0] as Team & { teamLeadId: number }).teamLeadId).toBe(2);
    });

    it('should do nothing when there are no teams and no students', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(baseDistribution);
      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([]);
      teamDistributionStudentService.getStudentsForDistribute.mockResolvedValueOnce([]);

      await service.distributeStudents(1);

      expect(queryRunner.manager.save).not.toHaveBeenCalled();
      expect(teamService.generatePassword).not.toHaveBeenCalled();
    });

    it('should leave students unplaced when reported capacity exceeds real free slots', async () => {
      // This exercises the `team` === undefined branch inside addStudentsToAvailableTeams:
      // capacity is forced higher than the actual number of empty slots, so once the
      // single open slot is filled, `teams.find(...)` returns undefined for the remaining
      // iterations while capacity is still > 0. The loop still terminates (capacity--).
      const distribution = { id: 1, strictTeamSize: 2, courseId: 9 } as TeamDistribution;
      repository.findOneOrFail.mockResolvedValueOnce(distribution);

      // Two teams: one full (no capacity), one with a single open slot.
      const fullTeam = buildTeam({
        id: 100,
        students: [buildStudent({ id: 1, rank: 1 }), buildStudent({ id: 2, rank: 2 })],
      });
      const openTeam = buildTeam({ id: 101, students: [buildStudent({ id: 3, rank: 3 })] });
      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([openTeam, fullTeam]);

      // Three students competing for one real slot. capacity computed = (2-1)+(2-2) = 1,
      // but with 3 students the second/third pop iterations find no team.
      const students = [
        buildTds({ id: 50, student: buildStudent({ id: 10, rank: 4 }) }),
        buildTds({ id: 51, student: buildStudent({ id: 11, rank: 5 }) }),
        buildTds({ id: 52, student: buildStudent({ id: 12, rank: 6 }) }),
      ];
      teamService.generatePassword.mockResolvedValue('pwZZZZ');
      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce(students) // first read
        .mockResolvedValueOnce(students.slice(0, 2)); // 2 still unplaced -> createRandomTeams

      await service.distributeStudents(1);

      // Exactly one student got distributed in the fill step.
      const firstSave = queryRunner.manager.save.mock.calls.find(
        call => call[0] === TeamDistributionStudent,
      )?.[1] as TeamDistributionStudent[];
      expect(firstSave).toHaveLength(1);
    });

    it('should tolerate snake-draft picks that fall outside the student array', async () => {
      // 3 students, teamSize 2 -> neededTeams = 2 (NOT < teamSize) -> snake draft with
      // 2 rounds. Some computed draft picks exceed the array length (index 3, the 4th
      // slot is empty), exercising the `if (teamDistributionStudents[draftPick - 1])` guard.
      const distribution = { id: 1, strictTeamSize: 2, courseId: 9 } as TeamDistribution;
      repository.findOneOrFail.mockResolvedValueOnce(distribution);

      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([]);
      teamService.generatePassword.mockResolvedValue('pwQQQQ');

      const students = [
        buildTds({ id: 1, student: buildStudent({ id: 1, rank: 1 }) }),
        buildTds({ id: 2, student: buildStudent({ id: 2, rank: 2 }) }),
        buildTds({ id: 3, student: buildStudent({ id: 3, rank: 3 }) }),
      ];
      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce(students)
        .mockResolvedValueOnce(students);

      await service.distributeStudents(1);

      const savedTeams = queryRunner.manager.save.mock.calls.find(call => call[0] === Team)?.[1] as Team[];
      expect(savedTeams).toHaveLength(2);
      // All three students are still placed; no phantom student from the out-of-range pick.
      const assignedIds = savedTeams.flatMap(t => t.students.map(s => s.id)).sort();
      expect(assignedIds).toEqual([1, 2, 3]);
    });
  });

  describe('modifyTeams transaction handling', () => {
    const baseDistribution = { id: 1, strictTeamSize: 2, courseId: 9 } as TeamDistribution;

    it('should roll back and throw InternalServerErrorException when the transaction fails', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(baseDistribution);

      const team = buildTeam({ id: 100, students: [buildStudent({ id: 1, rank: 1 })] });
      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([team]);
      teamDistributionStudentService.getStudentsForDistribute.mockResolvedValueOnce([
        buildTds({ id: 50, student: buildStudent({ id: 2, rank: 2 }) }),
      ]);

      // Make the transactional save reject so modifyTeams hits its catch branch.
      queryRunner.manager.save.mockRejectedValue(new Error('db down'));

      await expect(service.distributeStudents(1)).rejects.toBeInstanceOf(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should always release the query runner on success', async () => {
      repository.findOneOrFail.mockResolvedValueOnce(baseDistribution);

      const team = buildTeam({ id: 100, students: [buildStudent({ id: 1, rank: 1 })] });
      teamService.getTeamsAvailableForDistribute.mockResolvedValueOnce([team]);
      teamDistributionStudentService.getStudentsForDistribute
        .mockResolvedValueOnce([buildTds({ id: 50, student: buildStudent({ id: 2, rank: 2 }) })])
        .mockResolvedValueOnce([]);

      await service.distributeStudents(1);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
