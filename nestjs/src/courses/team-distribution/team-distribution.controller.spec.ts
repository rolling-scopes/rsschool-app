import { Test, TestingModule } from '@nestjs/testing';
import { TeamDistributionController } from './team-distribution.controller';
import { TeamDistributionService } from './team-distribution.service';
import { TeamService } from './team.service';
import { TeamDistributionStudentService } from './team-distribution-student.service';
import { DistributeStudentsService } from './distribute-students.service';

const courseId = 11;

const baseDistribution = {
  id: 5,
  name: 'Distribution 1',
  startDate: '2026-01-01',
  endDate: '2026-02-01',
  description: 'desc',
  descriptionUrl: 'https://x',
  minTeamSize: 2,
  maxTeamSize: 4,
  strictTeamSize: 3,
  strictTeamSizeMode: false,
  minTotalScore: 0,
  courseId,
};

const teamDistributionService = {
  create: vi.fn(),
  findByCourseId: vi.fn(),
  addStatusToDistribution: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
  getById: vi.fn(),
  submitScore: vi.fn(),
  getDistributionDetailedById: vi.fn(),
};
const teamService = { findTeamWithStudentsById: vi.fn() };
const teamDistributionStudentService = {
  getStudentWithRelations: vi.fn(),
  addStudentToTeamDistribution: vi.fn(),
  deleteStudentFromTeamDistribution: vi.fn(),
  getStudentsByTeamDistributionId: vi.fn(),
};
const distributeStudentsService = { distributeStudents: vi.fn() };

describe('TeamDistributionController', () => {
  let controller: TeamDistributionController;

  beforeEach(async () => {
    [teamDistributionService, teamService, teamDistributionStudentService, distributeStudentsService].forEach(svc =>
      Object.values(svc).forEach(fn => fn.mockReset()),
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamDistributionController],
      providers: [
        { provide: TeamDistributionService, useValue: teamDistributionService },
        { provide: TeamService, useValue: teamService },
        { provide: TeamDistributionStudentService, useValue: teamDistributionStudentService },
        { provide: DistributeStudentsService, useValue: distributeStudentsService },
      ],
    }).compile();

    controller = module.get(TeamDistributionController);
  });

  describe('create', () => {
    it('creates the distribution with the courseId injected and wraps it in a dto', async () => {
      teamDistributionService.create.mockResolvedValue(baseDistribution);
      const dto = { name: 'Distribution 1' } as never;

      const result = await controller.create(courseId, dto);

      expect(teamDistributionService.create).toHaveBeenCalledWith({ courseId, name: 'Distribution 1' });
      expect(result).toMatchObject({ id: 5, name: 'Distribution 1', registrationStatus: null });
    });
  });

  describe('getCourseTeamDistributions', () => {
    it('loads the student relations when a studentId is present and applies status to each distribution', async () => {
      const student = { id: 42 };
      teamDistributionStudentService.getStudentWithRelations.mockResolvedValue(student);
      teamDistributionService.findByCourseId.mockResolvedValue([baseDistribution]);
      teamDistributionService.addStatusToDistribution.mockReturnValue({
        ...baseDistribution,
        registrationStatus: 'available',
      });

      const result = await controller.getCourseTeamDistributions(42, courseId);

      expect(teamDistributionStudentService.getStudentWithRelations).toHaveBeenCalledWith(42, {
        user: true,
        teams: true,
        teamDistributionStudents: { teamDistribution: true },
      });
      expect(teamDistributionService.addStatusToDistribution).toHaveBeenCalledWith(baseDistribution, student);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 5, registrationStatus: 'available' });
    });

    it('skips student lookup when there is no studentId and uses a null student', async () => {
      teamDistributionService.findByCourseId.mockResolvedValue([baseDistribution]);
      teamDistributionService.addStatusToDistribution.mockReturnValue(baseDistribution);

      await controller.getCourseTeamDistributions(0, courseId);

      expect(teamDistributionStudentService.getStudentWithRelations).not.toHaveBeenCalled();
      expect(teamDistributionService.addStatusToDistribution).toHaveBeenCalledWith(baseDistribution, null);
    });
  });

  describe('delete', () => {
    it('removes the distribution by id', async () => {
      teamDistributionService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.delete(courseId, 5);

      expect(teamDistributionService.remove).toHaveBeenCalledWith(5);
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('update', () => {
    it('updates the distribution merging courseId and id into the dto', async () => {
      teamDistributionService.update.mockResolvedValue(undefined);
      const dto = { name: 'Updated' } as never;

      await controller.update(courseId, 5, dto);

      expect(teamDistributionService.update).toHaveBeenCalledWith(5, { courseId, id: 5, name: 'Updated' });
    });
  });

  describe('registry', () => {
    it('registers the student into the distribution when a studentId is present', async () => {
      teamDistributionService.getById.mockResolvedValue(baseDistribution);

      await controller.registry(42, courseId, 5);

      expect(teamDistributionService.getById).toHaveBeenCalledWith(5);
      expect(teamDistributionStudentService.addStudentToTeamDistribution).toHaveBeenCalledWith(
        42,
        baseDistribution,
        courseId,
      );
    });

    it('does not register anyone when there is no studentId', async () => {
      teamDistributionService.getById.mockResolvedValue(baseDistribution);

      await controller.registry(0, courseId, 5);

      expect(teamDistributionStudentService.addStudentToTeamDistribution).not.toHaveBeenCalled();
    });
  });

  describe('submitScore', () => {
    it('submits the score for the distribution task', async () => {
      teamDistributionService.submitScore.mockResolvedValue(undefined);

      await controller.submitScore({} as never, courseId, 5, 99);

      expect(teamDistributionService.submitScore).toHaveBeenCalledWith(5, 99);
    });
  });

  describe('deleteRegistry', () => {
    it('removes the current student from the distribution when a studentId is present', async () => {
      await controller.deleteRegistry(42, courseId, 5);

      expect(teamDistributionStudentService.deleteStudentFromTeamDistribution).toHaveBeenCalledWith(42, 5);
    });

    it('does nothing when there is no studentId', async () => {
      await controller.deleteRegistry(0, courseId, 5);

      expect(teamDistributionStudentService.deleteStudentFromTeamDistribution).not.toHaveBeenCalled();
    });
  });

  describe('deleteStudentFromDistribution', () => {
    it('removes the given student from the distribution', async () => {
      await controller.deleteStudentFromDistribution(42, courseId, 5);

      expect(teamDistributionStudentService.deleteStudentFromTeamDistribution).toHaveBeenCalledWith(42, 5);
    });
  });

  describe('getCourseTeamDistributionDetailed', () => {
    const detailed = {
      teamDistribution: baseDistribution,
      teamsCount: 3,
      studentsWithoutTeamCount: 7,
    };

    it('includes the student team when the registered student already belongs to a team in the distribution', async () => {
      teamDistributionStudentService.getStudentWithRelations.mockResolvedValue({
        teams: [{ id: 21, teamDistributionId: 5 }],
      });
      teamService.findTeamWithStudentsById.mockResolvedValue({
        id: 21,
        name: 'Team A',
        students: [],
      });
      teamDistributionService.getDistributionDetailedById.mockResolvedValue(detailed);

      const result = await controller.getCourseTeamDistributionDetailed(42, courseId, 5);

      expect(teamService.findTeamWithStudentsById).toHaveBeenCalledWith(21);
      expect(result).toMatchObject({
        id: 5,
        teamsCount: 3,
        studentsWithoutTeamCount: 7,
        myTeam: { id: 21, name: 'Team A' },
      });
    });

    it('omits the team when the student is not part of any team of this distribution', async () => {
      teamDistributionStudentService.getStudentWithRelations.mockResolvedValue({
        teams: [{ id: 99, teamDistributionId: 8 }],
      });
      teamDistributionService.getDistributionDetailedById.mockResolvedValue(detailed);

      const result = await controller.getCourseTeamDistributionDetailed(42, courseId, 5);

      expect(teamService.findTeamWithStudentsById).not.toHaveBeenCalled();
      expect(result.myTeam).toBeUndefined();
    });

    it('skips the student lookup entirely when there is no studentId', async () => {
      teamDistributionService.getDistributionDetailedById.mockResolvedValue(detailed);

      const result = await controller.getCourseTeamDistributionDetailed(0, courseId, 5);

      expect(teamDistributionStudentService.getStudentWithRelations).not.toHaveBeenCalled();
      expect(result.myTeam).toBeUndefined();
    });
  });

  describe('getStudentsWithoutTeam', () => {
    it('paginates students with the search filter and wraps them in a dto', async () => {
      teamDistributionStudentService.getStudentsByTeamDistributionId.mockResolvedValue({
        students: [],
        paginationMeta: { current: 1, pageSize: 10, total: 0, totalPages: 0, itemCount: 0 },
      });

      const result = await controller.getStudentsWithoutTeam(courseId, 5, 20, 2, 'john');

      expect(teamDistributionStudentService.getStudentsByTeamDistributionId).toHaveBeenCalledWith(5, {
        page: 2,
        limit: 20,
        search: 'john',
      });
      expect(result.content).toEqual([]);
    });
  });

  describe('distributeStudentsToTeam', () => {
    it('triggers the auto distribution for the distribution id', async () => {
      await controller.distributeStudentsToTeam(courseId, 5);

      expect(distributeStudentsService.distributeStudents).toHaveBeenCalledWith(5);
    });
  });
});
