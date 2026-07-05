import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseRole } from 'src/auth';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TeamDistributionStudentService } from './team-distribution-student.service';

const courseId = 11;
const distributionId = 5;

const buildStudent = (id: number, githubId: string) => ({
  id,
  rank: id,
  totalScore: 0,
  user: {
    id: id + 1000,
    firstName: 'First',
    lastName: githubId,
    githubId,
    cvLink: null,
    discord: null,
    contactsTelegram: null,
    contactsEmail: null,
    cityName: null,
    countryName: null,
    resume: [],
  },
});

const buildTeam = (overrides: Record<string, unknown> = {}) => ({
  id: 21,
  name: 'Team A',
  chatLink: null,
  description: null,
  teamLeadId: null,
  teamDistributionId: distributionId,
  password: 'secret',
  students: [],
  teamDistribution: { strictTeamSizeMode: false, strictTeamSize: 3 },
  ...overrides,
});

const managerReq = { user: { isAdmin: false, courses: { [courseId]: { roles: [CourseRole.Manager] } } } } as never;
const studentReq = { user: { isAdmin: false, courses: { [courseId]: { roles: [CourseRole.Student] } } } } as never;

const teamService = {
  findByDistributionId: vi.fn(),
  create: vi.fn(),
  findTeamWithStudentsById: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  generatePassword: vi.fn(),
  updatePassword: vi.fn(),
  addStudentToTeam: vi.fn(),
  deleteStudentFromTeam: vi.fn(),
  getStudentsCountInTeam: vi.fn(),
  remove: vi.fn(),
};
const teamDistributionStudentService = {
  getTeamDistributionStudent: vi.fn(),
  getStudentsForTeamByManager: vi.fn(),
  findByStudentIds: vi.fn(),
  saveTeamDistributionStudents: vi.fn(),
};

describe('TeamController', () => {
  let controller: TeamController;

  beforeEach(async () => {
    [teamService, teamDistributionStudentService].forEach(svc => Object.values(svc).forEach(fn => fn.mockReset()));

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        { provide: TeamService, useValue: teamService },
        { provide: TeamDistributionStudentService, useValue: teamDistributionStudentService },
      ],
    }).compile();

    controller = module.get(TeamController);
  });

  describe('getTeams', () => {
    it('paginates teams with the search filter and wraps them into a dto', async () => {
      teamService.findByDistributionId.mockResolvedValue({
        teams: [],
        paginationMeta: { current: 1, pageSize: 10, total: 0, totalPages: 0, itemCount: 0 },
      });

      const result = await controller.getTeams(courseId, distributionId, 20, 2, 'a');

      expect(teamService.findByDistributionId).toHaveBeenCalledWith(distributionId, {
        page: 2,
        limit: 20,
        search: 'a',
      });
      expect(result.content).toEqual([]);
    });
  });

  describe('create', () => {
    it('as a manager, builds the team from the manager-selected students', async () => {
      const students = [buildStudent(1, 'john')];
      teamDistributionStudentService.getStudentsForTeamByManager.mockResolvedValue(students);
      teamService.create.mockResolvedValue({ id: 21 });
      teamService.findTeamWithStudentsById.mockResolvedValue(buildTeam({ students }));
      teamDistributionStudentService.findByStudentIds.mockResolvedValue([{ id: 70, distributed: false }]);

      const result = await controller.create(42, managerReq, courseId, distributionId, { studentIds: [1] } as never);

      expect(teamDistributionStudentService.getStudentsForTeamByManager).toHaveBeenCalledWith(
        [1],
        distributionId,
        courseId,
      );
      expect(teamService.create).toHaveBeenCalledWith({
        teamDistributionId: distributionId,
        students,
        studentIds: [1],
      });
      expect(teamDistributionStudentService.saveTeamDistributionStudents).toHaveBeenCalledWith([
        { id: 70, distributed: true },
      ]);
      expect(result).toMatchObject({ id: 21, name: 'Team A' });
    });

    it('as a student, adds the calling student when they are not yet distributed', async () => {
      const student = buildStudent(1, 'john');
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({ distributed: false, student });
      teamService.create.mockResolvedValue({ id: 21 });
      teamService.findTeamWithStudentsById.mockResolvedValue(buildTeam({ students: [student] }));
      teamDistributionStudentService.findByStudentIds.mockResolvedValue([{ id: 70, distributed: false }]);

      await controller.create(1, studentReq, courseId, distributionId, {} as never);

      expect(teamDistributionStudentService.getTeamDistributionStudent).toHaveBeenCalledWith(1, distributionId, true);
      expect(teamService.create).toHaveBeenCalledWith(
        expect.objectContaining({ students: [student], teamDistributionId: distributionId }),
      );
    });

    it('as a student, rejects when the calling student is already distributed', async () => {
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({ distributed: true, student: {} });

      await expect(controller.create(1, studentReq, courseId, distributionId, {} as never)).rejects.toThrow(
        BadRequestException,
      );
      expect(teamService.create).not.toHaveBeenCalled();
    });

    it('does not mark distribution students when the created team has no students', async () => {
      teamDistributionStudentService.getStudentsForTeamByManager.mockResolvedValue([]);
      teamService.create.mockResolvedValue({ id: 21 });
      teamService.findTeamWithStudentsById.mockResolvedValue(buildTeam({ students: [] }));

      await controller.create(42, managerReq, courseId, distributionId, { studentIds: [] } as never);

      expect(teamDistributionStudentService.findByStudentIds).not.toHaveBeenCalled();
      expect(teamDistributionStudentService.saveTeamDistributionStudents).not.toHaveBeenCalled();
    });
  });

  describe('updateTeam', () => {
    it('uses save (squad-aware) when the caller is a manager', async () => {
      const dto = { name: 'Renamed' } as never;

      await controller.updateTeam(managerReq, courseId, distributionId, 21, dto);

      expect(teamService.save).toHaveBeenCalledWith(21, dto, distributionId, courseId);
      expect(teamService.update).not.toHaveBeenCalled();
    });

    it('uses update when the caller is a plain student/team lead', async () => {
      const dto = { name: 'Renamed' } as never;

      await controller.updateTeam(studentReq, courseId, distributionId, 21, dto);

      expect(teamService.update).toHaveBeenCalledWith(21, dto);
      expect(teamService.save).not.toHaveBeenCalled();
    });
  });

  describe('getTeamPassword', () => {
    it('returns the team password formatted as id_password', async () => {
      teamService.findById.mockResolvedValue({ id: 21, password: 'secret' });

      const result = await controller.getTeamPassword(courseId, distributionId, 21);

      expect(teamService.findById).toHaveBeenCalledWith(21);
      expect(result).toEqual({ password: '21_secret' });
    });
  });

  describe('changeTeamPassword', () => {
    it('generates a fresh password, persists it, and returns the formatted value', async () => {
      teamService.generatePassword.mockResolvedValue('newpass');

      const result = await controller.changeTeamPassword(courseId, distributionId, 21);

      expect(teamService.updatePassword).toHaveBeenCalledWith(21, 'newpass');
      expect(result).toEqual({ password: '21_newpass' });
    });
  });

  describe('joinTeam', () => {
    it('adds the student to the team on a valid password and returns team info', async () => {
      const team = buildTeam({ students: [] });
      teamService.findById.mockResolvedValue(team);
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({
        distributed: false,
        active: true,
        student: buildStudent(1, 'john'),
      });

      const result = await controller.joinTeam(1, courseId, distributionId, 21, { password: 'secret' } as never);

      expect(teamService.addStudentToTeam).toHaveBeenCalledWith(
        team,
        expect.objectContaining({ id: 1 }),
        distributionId,
      );
      expect(result).toMatchObject({ id: 21, name: 'Team A' });
    });

    it('rejects when there is no studentId', async () => {
      await expect(
        controller.joinTeam(0, courseId, distributionId, 21, { password: 'secret' } as never),
      ).rejects.toThrow(BadRequestException);
      expect(teamService.findById).not.toHaveBeenCalled();
    });

    it('rejects an invalid password', async () => {
      teamService.findById.mockResolvedValue(buildTeam());

      await expect(
        controller.joinTeam(1, courseId, distributionId, 21, { password: 'wrong' } as never),
      ).rejects.toThrow('Invalid password');
    });

    it('rejects when the team is full in strict team size mode', async () => {
      teamService.findById.mockResolvedValue(
        buildTeam({
          students: [buildStudent(1, 'a'), buildStudent(2, 'b'), buildStudent(3, 'c')],
          teamDistribution: { strictTeamSizeMode: true, strictTeamSize: 3 },
        }),
      );

      await expect(
        controller.joinTeam(1, courseId, distributionId, 21, { password: 'secret' } as never),
      ).rejects.toThrow(BadRequestException);
      expect(teamService.addStudentToTeam).not.toHaveBeenCalled();
    });

    it('rejects when the joining student is already distributed or inactive', async () => {
      teamService.findById.mockResolvedValue(buildTeam());
      teamDistributionStudentService.getTeamDistributionStudent.mockResolvedValue({
        distributed: true,
        active: true,
        student: buildStudent(1, 'john'),
      });

      await expect(
        controller.joinTeam(1, courseId, distributionId, 21, { password: 'secret' } as never),
      ).rejects.toThrow(BadRequestException);
      expect(teamService.addStudentToTeam).not.toHaveBeenCalled();
    });
  });

  describe('leaveTeam', () => {
    it('removes the student and deletes the team when it becomes empty', async () => {
      teamService.getStudentsCountInTeam.mockResolvedValue(0);

      await controller.leaveTeam(1, courseId, distributionId, 21);

      expect(teamService.deleteStudentFromTeam).toHaveBeenCalledWith(21, 1, distributionId);
      expect(teamService.remove).toHaveBeenCalledWith(21);
    });

    it('keeps the team when other students remain', async () => {
      teamService.getStudentsCountInTeam.mockResolvedValue(2);

      await controller.leaveTeam(1, courseId, distributionId, 21);

      expect(teamService.deleteStudentFromTeam).toHaveBeenCalledWith(21, 1, distributionId);
      expect(teamService.remove).not.toHaveBeenCalled();
    });

    it('rejects when there is no studentId', async () => {
      await expect(controller.leaveTeam(0, courseId, distributionId, 21)).rejects.toThrow(BadRequestException);
      expect(teamService.deleteStudentFromTeam).not.toHaveBeenCalled();
    });
  });
});
