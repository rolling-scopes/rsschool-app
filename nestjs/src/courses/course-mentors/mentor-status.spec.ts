import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CourseTask, Mentor, TaskResult } from '@entities/index';
import { Student } from '@entities/student';
import { StageInterview } from '@entities/stageInterview';
import { CourseMentorsService } from './course-mentors.service';

// Fixtures mirrored from server/src/services/__test__/mentor-status.test.ts to prove business-logic equivalence
const mockMentor = { id: 7, user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe' } };

const createMentorQbMock = (result: unknown) => {
  const qb = {
    innerJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getOne: vi.fn().mockResolvedValue(result),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

const createInterviewsQbMock = (result: unknown[]) => {
  const qb = {
    select: vi.fn(),
    leftJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getMany: vi.fn().mockResolvedValue(result),
  };
  qb.select.mockReturnValue(qb);
  qb.leftJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

describe('CourseMentorsService expel/restore', () => {
  let service: CourseMentorsService;
  const mentorsRepository = { createQueryBuilder: vi.fn(), update: vi.fn() };
  const studentRepository = { update: vi.fn() };
  const stageInterviewRepository = { createQueryBuilder: vi.fn(), update: vi.fn() };

  const setup = (mentor: unknown, interviews: unknown[] = []) => {
    mentorsRepository.createQueryBuilder.mockReturnValue(createMentorQbMock(mentor));
    stageInterviewRepository.createQueryBuilder.mockReturnValue(createInterviewsQbMock(interviews));
  };

  beforeEach(async () => {
    [mentorsRepository, studentRepository, stageInterviewRepository].forEach(repo =>
      Object.values(repo).forEach(fn => fn.mockReset()),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseMentorsService,
        { provide: getRepositoryToken(Mentor), useValue: mentorsRepository },
        { provide: getRepositoryToken(CourseTask), useValue: {} },
        { provide: getRepositoryToken(TaskResult), useValue: {} },
        {
          provide: DataSource,
          useValue: {
            getRepository: (entity: unknown) => {
              if (entity === Student) return studentRepository;
              if (entity === StageInterview) return stageInterviewRepository;
              throw new Error('unexpected repository');
            },
          },
        },
      ],
    }).compile();

    service = module.get(CourseMentorsService);
  });

  describe('expelMentor', () => {
    it('unassigns students, marks mentor expelled and cancels pending stage interviews', async () => {
      setup(mockMentor, [{ id: 100 }, { id: 101 }]);

      await service.expelMentor(5, 'john-doe');

      const mentorQb = mentorsRepository.createQueryBuilder.mock.results[0].value;
      expect(mentorQb.where).toHaveBeenCalledWith('user.githubId = :githubId', { githubId: 'john-doe' });
      expect(mentorQb.andWhere).toHaveBeenCalledWith('mentor.courseId = :courseId', { courseId: 5 });
      expect(studentRepository.update).toHaveBeenCalledWith({ mentorId: 7 }, { mentorId: null });
      expect(mentorsRepository.update).toHaveBeenCalledWith(7, { isExpelled: true });
      // pending (no feedback) interviews of the mentor are canceled
      const interviewsQb = stageInterviewRepository.createQueryBuilder.mock.results[0].value;
      expect(interviewsQb.where).toHaveBeenCalledWith('f.id IS NULL');
      expect(interviewsQb.andWhere).toHaveBeenCalledWith('s.mentorId = :mentorId', { mentorId: 7 });
      expect(stageInterviewRepository.update).toHaveBeenCalledWith([100, 101], { isCanceled: true });
    });

    it('does not cancel interviews when there are no pending ones', async () => {
      setup(mockMentor, []);

      await service.expelMentor(5, 'john-doe');

      expect(stageInterviewRepository.update).not.toHaveBeenCalled();
    });

    it('does nothing when mentor is not found', async () => {
      setup(null);

      await service.expelMentor(5, 'john-doe');

      expect(studentRepository.update).not.toHaveBeenCalled();
      expect(mentorsRepository.update).not.toHaveBeenCalled();
      expect(stageInterviewRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('restoreMentor', () => {
    it('restores expelled mentor', async () => {
      setup(mockMentor);

      await service.restoreMentor(5, 'john-doe');

      expect(mentorsRepository.update).toHaveBeenCalledWith(7, { isExpelled: false });
      expect(studentRepository.update).not.toHaveBeenCalled();
    });

    it('does nothing when mentor is not found', async () => {
      setup(null);

      await service.restoreMentor(5, 'john-doe');

      expect(mentorsRepository.update).not.toHaveBeenCalled();
    });
  });
});
