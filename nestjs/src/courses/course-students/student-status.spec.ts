import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { CourseStudentsController } from './course-students.controller';
import { CourseStudentsService } from './course-students.service';

// Fixtures mirrored from server/src/routes/course/__test__/studentStatus.test.ts to prove business-logic equivalence
const session = { id: 1, githubId: 'viewer', isAdmin: false, courses: {} } as never;
const adminSession = { id: 1, githubId: 'viewer', isAdmin: true, courses: {} } as never;

const studentRepository = { update: vi.fn() };
const mentorRepository = { findOne: vi.fn() };
const stageInterviewRepository = { update: vi.fn(), createQueryBuilder: vi.fn() };

const createInterviewsQb = (githubIds: string[]) => {
  const qb = {
    innerJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    getMany: vi.fn().mockResolvedValue(githubIds.map(githubId => ({ mentor: { user: { githubId } } }))),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  return qb;
};

describe('student status', () => {
  let service: CourseStudentsService;
  let controller: CourseStudentsController;
  const mockGetStudentByGithubId = vi.fn();

  beforeEach(async () => {
    [studentRepository, mentorRepository, stageInterviewRepository].forEach(repo =>
      Object.values(repo).forEach(fn => fn.mockReset()),
    );
    mockGetStudentByGithubId.mockReset();
    stageInterviewRepository.createQueryBuilder.mockReturnValue(createInterviewsQb([]));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseStudentsService,
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorRepository },
        { provide: DataSource, useValue: { getRepository: () => stageInterviewRepository } },
      ],
    }).compile();
    service = module.get(CourseStudentsService);
    vi.spyOn(service, 'getStudentByGithubId').mockImplementation(mockGetStudentByGithubId);

    const controllerModule: TestingModule = await Test.createTestingModule({
      controllers: [CourseStudentsController],
      providers: [{ provide: CourseStudentsService, useValue: service }],
    }).compile();
    controller = controllerModule.get(CourseStudentsController);
  });

  describe('canChangeStatus', () => {
    it('denies when student is not found', async () => {
      mockGetStudentByGithubId.mockResolvedValue(null);

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: false, message: 'not valid student' });
    });

    it('allows power users and dementors immediately', async () => {
      mockGetStudentByGithubId.mockResolvedValue({ id: 42, mentorId: 9 });

      const result = await service.canChangeStatus(adminSession, 5, 'john-doe');

      expect(result).toEqual({ allow: true });
    });

    it('denies non-mentors', async () => {
      mockGetStudentByGithubId.mockResolvedValue({ id: 42, mentorId: 9 });
      mentorRepository.findOne.mockResolvedValue(null);

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: false, message: 'not valid mentor' });
    });

    it('denies mentors not related to the student, allows own mentor', async () => {
      mockGetStudentByGithubId.mockResolvedValue({ id: 42, mentorId: 9 });
      mentorRepository.findOne.mockResolvedValue({ id: 8 });

      const denied = await service.canChangeStatus(session, 5, 'john-doe');
      expect(denied).toEqual({ allow: false, message: 'incorrect mentor-student relation' });

      mentorRepository.findOne.mockResolvedValue({ id: 9 });
      const allowed = await service.canChangeStatus(session, 5, 'john-doe');
      expect(allowed).toEqual({ allow: true });
    });

    it('allows the stage interviewer of the student', async () => {
      mockGetStudentByGithubId.mockResolvedValue({ id: 42, mentorId: 9 });
      mentorRepository.findOne.mockResolvedValue({ id: 8 });
      stageInterviewRepository.createQueryBuilder.mockReturnValue(createInterviewsQb(['viewer']));

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: true });
    });
  });

  describe('updateStudentStatus route', () => {
    it('expels student with comment when allowed', async () => {
      mockGetStudentByGithubId.mockResolvedValue({ id: 42, mentorId: 9 });

      await controller.updateStudentStatus({ user: adminSession } as never, 5, 'john-doe', {
        status: 'expelled',
        comment: 'reason',
      });

      expect(studentRepository.update).toHaveBeenCalledWith(42, {
        mentorId: null,
        isExpelled: true,
        expellingReason: 'reason',
        endDate: expect.any(Date),
      });
      expect(stageInterviewRepository.update).toHaveBeenCalledWith(
        { studentId: 42, isCompleted: false },
        { isCanceled: true },
      );
    });

    it('restores and sets self-study', async () => {
      mockGetStudentByGithubId.mockResolvedValue({ id: 42, mentorId: 9 });

      await controller.updateStudentStatus({ user: adminSession } as never, 5, 'john-doe', { status: 'active' });
      expect(studentRepository.update).toHaveBeenCalledWith(42, {
        isExpelled: false,
        expellingReason: '',
        endDate: null,
      });

      await controller.updateStudentStatus({ user: adminSession } as never, 5, 'john-doe', {
        status: 'self-study',
        comment: 'c',
      });
      expect(studentRepository.update).toHaveBeenCalledWith(42, {
        mentorId: null,
        mentoring: false,
        expellingReason: 'c',
      });
    });

    it('responds 400 when not allowed', async () => {
      mockGetStudentByGithubId.mockResolvedValue(null);

      await expect(
        controller.updateStudentStatus({ user: session } as never, 5, 'john-doe', { status: 'expelled' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('selfUpdateStudentStatus route', () => {
    it('sets self-study for own record only', async () => {
      mockGetStudentByGithubId.mockResolvedValue({ id: 42 });

      await controller.selfUpdateStudentStatus({ user: { githubId: 'viewer' } } as never, 5, 'viewer', {
        status: 'self-study',
      });

      expect(studentRepository.update).toHaveBeenCalledWith(42, {
        mentorId: null,
        mentoring: false,
        expellingReason: '',
      });
    });

    it('denies for other users', async () => {
      await expect(
        controller.selfUpdateStudentStatus({ user: { githubId: 'viewer' } } as never, 5, 'john-doe', {
          status: 'self-study',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(studentRepository.update).not.toHaveBeenCalled();
    });
  });
});
