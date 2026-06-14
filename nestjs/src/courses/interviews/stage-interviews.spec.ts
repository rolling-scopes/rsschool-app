import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { Mentor } from '@entities/mentor';
import { StageInterview } from '@entities/stageInterview';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { Student } from '@entities/student';
import { StageInterviewsService } from './stage-interviews.service';

// Fixtures mirrored from server/src/routes/course/__test__/stageInterviews.test.ts and the legacy
// StageInterviewRepository to prove business-logic equivalence
const repos = {
  stageInterview: { createQueryBuilder: vi.fn(), findOneBy: vi.fn(), update: vi.fn(), save: vi.fn() },
  stageInterviewStudent: { createQueryBuilder: vi.fn() },
  courseTask: { findOne: vi.fn(), find: vi.fn() },
  student: { createQueryBuilder: vi.fn() },
  mentor: { createQueryBuilder: vi.fn() },
};

const createGetOneQb = (result: unknown) => {
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

const mentorRecord = { id: 8, user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x' } };
const studentRecord = { id: 42, user: { id: 100, firstName: 'John', lastName: 'Doe', githubId: 'john-doe' } };

describe('StageInterviewsService', () => {
  let service: StageInterviewsService;

  beforeEach(async () => {
    Object.values(repos).forEach(repo => Object.values(repo).forEach(fn => fn.mockReset()));
    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(mentorRecord));
    repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(studentRecord));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StageInterviewsService,
        { provide: getRepositoryToken(StageInterview), useValue: repos.stageInterview },
        { provide: getRepositoryToken(StageInterviewStudent), useValue: repos.stageInterviewStudent },
        { provide: getRepositoryToken(CourseTask), useValue: repos.courseTask },
        { provide: getRepositoryToken(Student), useValue: repos.student },
        { provide: getRepositoryToken(Mentor), useValue: repos.mentor },
      ],
    }).compile();
    service = module.get(StageInterviewsService);
  });

  it('creates a single pair against the active stage interview task', async () => {
    repos.courseTask.findOne.mockResolvedValue({ id: 7 });
    repos.stageInterview.save.mockResolvedValue({ id: 99 });

    const result = await service.create(5, 'john-doe', 'mentor-x');

    expect(repos.courseTask.findOne).toHaveBeenCalledWith({
      where: { courseId: 5, type: 'stage-interview', disabled: false },
    });
    expect(repos.stageInterview.save).toHaveBeenCalledWith({
      courseId: 5,
      mentorId: 8,
      studentId: 42,
      courseTaskId: 7,
    });
    expect(result).toEqual({ id: 99 });
  });

  it('returns null when task, student or interviewer is missing', async () => {
    repos.courseTask.findOne.mockResolvedValue(null);

    const result = await service.create(5, 'john-doe', 'mentor-x');

    expect(result).toBeNull();
    expect(repos.stageInterview.save).not.toHaveBeenCalled();
  });

  it('updates the interviewer only when interview and mentor exist', async () => {
    repos.stageInterview.findOneBy.mockResolvedValue({ id: 33, courseId: 5 });

    await service.updateInterviewer(33, 'mentor-x');

    expect(repos.stageInterview.update).toHaveBeenCalledWith(33, { mentorId: 8 });

    repos.stageInterview.update.mockReset();
    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(null));
    await service.updateInterviewer(33, 'unknown');
    expect(repos.stageInterview.update).not.toHaveBeenCalled();
  });

  it('cancels a pair by marking it canceled', async () => {
    repos.stageInterview.update.mockResolvedValue({ affected: 1 });

    await service.cancel(33);

    expect(repos.stageInterview.update).toHaveBeenCalledWith(33, { isCanceled: true });
  });

  it('rejects automatic distribution with more than one stage interview task', async () => {
    repos.courseTask.find.mockResolvedValue([{ id: 7 }, { id: 8 }]);

    await expect(service.createAutomatically(5, false)).rejects.toThrow('More than one stage interview task');
  });

  it('returns empty result when there is no stage interview task', async () => {
    repos.courseTask.find.mockResolvedValue([]);

    expect(await service.createAutomatically(5, false)).toEqual([]);
  });

  it('distributes registered students and saves the pairs', async () => {
    repos.courseTask.find.mockResolvedValue([{ id: 7 }]);
    repos.stageInterview.save.mockResolvedValue([{ mentorId: 8, studentId: 42 }]);
    (vi.spyOn(service as never, 'getMentorsWithStudents' as never) as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const findRegistered = (
      vi.spyOn(service as never, 'findRegisteredStudents' as never) as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    const getActive = (
      vi.spyOn(service as never, 'getActiveStudents' as never) as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    vi.spyOn(service, 'findMany').mockResolvedValue([] as never);

    await service.createAutomatically(5, false);
    expect(findRegistered).toHaveBeenCalledWith(5);
    expect(getActive).not.toHaveBeenCalled();

    await service.createAutomatically(5, true);
    expect(getActive).toHaveBeenCalledWith(5);
    expect(repos.stageInterview.save).toHaveBeenCalled();
  });
});
