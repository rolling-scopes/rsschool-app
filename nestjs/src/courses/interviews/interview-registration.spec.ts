import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { StageInterview } from '@entities/stageInterview';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { TaskChecker } from '@entities/taskChecker';
import { User } from '@entities/user';
import { InterviewsService } from './interviews.service';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { UserNotificationsService } from 'src/users-notifications';

// Fixtures mirrored from server/src/routes/course/__test__/interviewStudentRecord.test.ts to prove business-logic equivalence
const createStudentQb = (student: unknown) => {
  const qb = { innerJoin: vi.fn(), where: vi.fn(), andWhere: vi.fn(), getOne: vi.fn().mockResolvedValue(student) };
  qb.innerJoin.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

const studentRepository = { createQueryBuilder: vi.fn() };
const stageInterviewStudentRepository = { findOne: vi.fn() };
const taskInterviewStudentRepository = { findOne: vi.fn() };

describe('InterviewsService.getRegisteredInterviewStudent', () => {
  let service: InterviewsService;

  beforeEach(async () => {
    [studentRepository, stageInterviewStudentRepository, taskInterviewStudentRepository].forEach(repo =>
      Object.values(repo).forEach(fn => fn.mockReset()),
    );
    studentRepository.createQueryBuilder.mockReturnValue(createStudentQb({ id: 42 }));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(CourseTask), useValue: {} },
        { provide: getRepositoryToken(TaskInterviewStudent), useValue: taskInterviewStudentRepository },
        { provide: getRepositoryToken(TaskInterviewResult), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Mentor), useValue: {} },
        { provide: getRepositoryToken(StageInterview), useValue: {} },
        { provide: getRepositoryToken(StageInterviewStudent), useValue: stageInterviewStudentRepository },
        { provide: getRepositoryToken(TaskChecker), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: CrossMentorDistributionService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();
    service = module.get(InterviewsService);
  });

  it('returns undefined for unknown student (mapped to 400)', async () => {
    studentRepository.createQueryBuilder.mockReturnValue(createStudentQb(null));

    expect(await service.getRegisteredInterviewStudent(5, 'john-doe', '7')).toBeUndefined();
  });

  it('returns registered record id for a regular interview', async () => {
    taskInterviewStudentRepository.findOne.mockResolvedValue({ id: 99 });

    const result = await service.getRegisteredInterviewStudent(5, 'john-doe', '7');

    expect(taskInterviewStudentRepository.findOne).toHaveBeenCalledWith({
      where: { courseId: 5, studentId: 42, courseTaskId: 7 },
    });
    expect(result).toEqual({ id: 99 });
  });

  it('returns registered record id for the stage interview', async () => {
    stageInterviewStudentRepository.findOne.mockResolvedValue({ id: 77 });

    const result = await service.getRegisteredInterviewStudent(5, 'john-doe', 'stage');

    expect(stageInterviewStudentRepository.findOne).toHaveBeenCalledWith({
      where: { courseId: 5, studentId: 42 },
    });
    expect(result).toEqual({ id: 77 });
  });
});
