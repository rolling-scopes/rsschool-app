import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskChecker } from '@entities/taskChecker';
import { Mentor } from '@entities/mentor';
import { TaskSolution } from '@entities/taskSolution';
import { CourseTasksService } from './course-tasks.service';
import { CrossMentorDistributionService } from '../interviews/cross-mentor-distribution.service';

// Fixtures mirrored from server/src/routes/course/__test__/taskDistribution.test.ts to prove business-logic equivalence
const mockMentors = [{ id: 1, students: [{ id: 11 }, { id: 12 }] }];

const courseTaskRepository = { findOne: vi.fn() };
const checkerRepository = { delete: vi.fn(), findBy: vi.fn(), insert: vi.fn() };
const mentorQb = () => {
  const qb = {
    innerJoinAndSelect: vi.fn(),
    leftJoinAndSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getMany: vi.fn(),
  };
  qb.innerJoinAndSelect.mockReturnValue(qb);
  qb.leftJoinAndSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};
const mockDistribute = vi.fn();

describe('CourseTasksService.createTaskDistribution', () => {
  let service: CourseTasksService;
  let qb: ReturnType<typeof mentorQb>;

  beforeEach(async () => {
    [courseTaskRepository, checkerRepository].forEach(repo => Object.values(repo).forEach(fn => fn.mockReset()));
    mockDistribute.mockReset();
    qb = mentorQb();
    courseTaskRepository.findOne.mockResolvedValue({ id: 7 });
    checkerRepository.findBy.mockResolvedValue([]);
    qb.getMany.mockResolvedValue(mockMentors);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseTasksService,
        { provide: getRepositoryToken(CourseTask), useValue: courseTaskRepository },
        { provide: getRepositoryToken(TaskSolution), useValue: {} },
        { provide: CrossMentorDistributionService, useValue: { distribute: mockDistribute } },
        {
          provide: DataSource,
          useValue: {
            getRepository: (entity: unknown) => {
              if (entity === Mentor) return { createQueryBuilder: () => qb };
              if (entity === TaskChecker) return checkerRepository;
              throw new Error('unexpected repo');
            },
          },
        },
      ],
    }).compile();
    service = module.get(CourseTasksService);
  });

  it('returns null for unknown course task', async () => {
    courseTaskRepository.findOne.mockResolvedValue(null);

    const result = await service.createTaskDistribution(5, 7, undefined);

    expect(result).toBeNull();
  });

  it('returns empty result when course has no active mentors', async () => {
    qb.getMany.mockResolvedValue([]);

    const result = await service.createTaskDistribution(5, 7, undefined);

    expect(result).toEqual({});
    expect(checkerRepository.insert).not.toHaveBeenCalled();
  });

  it('cleans existing pairs on request and inserts distributed cross-mentor pairs', async () => {
    mockDistribute.mockReturnValue({ mentors: [{ id: 1, students: [{ id: 12 }] }] });

    const result = await service.createTaskDistribution(5, 7, true);

    expect(qb.where).toHaveBeenCalledWith('mentor.courseId = :courseId', { courseId: 5 });
    expect(qb.andWhere).toHaveBeenCalledWith('students.isExpelled = false');
    expect(checkerRepository.delete).toHaveBeenCalledWith({ courseTaskId: 7 });
    expect(mockDistribute).toHaveBeenCalledWith(mockMentors, []);
    expect(checkerRepository.insert).toHaveBeenCalledWith([{ courseTaskId: 7, mentorId: 1, studentId: 12 }]);
    expect(result).toEqual([{ courseTaskId: 7, mentorId: 1, studentId: 12 }]);
  });

  it('treats a distributed mentor without a students array as contributing no pairs', async () => {
    mockDistribute.mockReturnValue({ mentors: [{ id: 1 }, { id: 2, students: [{ id: 12 }] }] });

    const result = await service.createTaskDistribution(5, 7, undefined);

    // mentor 1 has no students -> ?? [] fallback; only mentor 2 produces a pair
    expect(checkerRepository.insert).toHaveBeenCalledWith([{ courseTaskId: 7, mentorId: 2, studentId: 12 }]);
    expect(result).toEqual([{ courseTaskId: 7, mentorId: 2, studentId: 12 }]);
  });

  it('keeps existing pairs when clean is not requested', async () => {
    checkerRepository.findBy.mockResolvedValue([{ studentId: 11, mentorId: 1 }]);
    mockDistribute.mockReturnValue({ mentors: [] });

    await service.createTaskDistribution(5, 7, undefined);

    expect(checkerRepository.delete).not.toHaveBeenCalled();
    expect(mockDistribute).toHaveBeenCalledWith(mockMentors, [{ studentId: 11, mentorId: 1 }]);
  });
});
