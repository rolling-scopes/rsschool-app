import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { StageInterview } from '@entities/stageInterview';
import { TaskChecker } from '@entities/taskChecker';
import { User } from '@entities/user';
import { InterviewsService } from './interviews.service';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { UserNotificationsService } from 'src/users-notifications';

// Fixtures mirrored from server/src/routes/course/__test__/interviewStudents.test.ts to prove business-logic equivalence
const mockStudentRecord = {
  id: 42,
  isExpelled: false,
  isFailed: false,
  totalScore: 100,
  user: {
    firstName: 'John',
    lastName: 'Doe',
    githubId: 'john-doe',
    cityName: 'Warsaw',
    countryName: 'Poland',
    discord: null,
  },
};

const createQb = (method: 'getOne' | 'getMany', result: unknown) => {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {
    innerJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getOne: vi.fn(),
    getMany: vi.fn(),
  };
  Object.keys(qb).forEach(k => qb[k].mockReturnValue(qb));
  qb[method].mockResolvedValue(result);
  return qb;
};

const studentRepository = { createQueryBuilder: vi.fn() };
const mentorRepository = { createQueryBuilder: vi.fn() };

describe('InterviewsService.getInterviewStudentsByMentor', () => {
  let service: InterviewsService;

  beforeEach(async () => {
    studentRepository.createQueryBuilder.mockReset();
    mentorRepository.createQueryBuilder.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(CourseTask), useValue: {} },
        { provide: getRepositoryToken(TaskInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(TaskInterviewResult), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorRepository },
        { provide: getRepositoryToken(StageInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(StageInterview), useValue: {} },
        { provide: getRepositoryToken(TaskChecker), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: CrossMentorDistributionService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();
    service = module.get(InterviewsService);
  });

  it('returns null for unknown mentor', async () => {
    mentorRepository.createQueryBuilder.mockReturnValue(createQb('getOne', null));

    const result = await service.getInterviewStudentsByMentor(5, 7, 'mentor-x');

    expect(result).toBeNull();
  });

  it('selects task-checker students of the mentor and maps them to student basics', async () => {
    mentorRepository.createQueryBuilder.mockReturnValue(createQb('getOne', { id: 8 }));
    const studentsQb = createQb('getMany', [mockStudentRecord]);
    studentRepository.createQueryBuilder.mockReturnValue(studentsQb);

    const result = await service.getInterviewStudentsByMentor(5, 7, 'mentor-x');

    expect(studentsQb.innerJoin).toHaveBeenCalledWith('student.taskChecker', 'taskChecker');
    expect(studentsQb.where).toHaveBeenCalledWith('"taskChecker"."courseTaskId" = :courseTaskId', { courseTaskId: 7 });
    expect(studentsQb.andWhere).toHaveBeenCalledWith('"taskChecker"."mentorId" = :mentorId', { mentorId: 8 });
    expect(result).toEqual([
      {
        name: 'John Doe',
        isActive: true,
        id: 42,
        githubId: 'john-doe',
        mentor: null,
        cityName: 'Warsaw',
        countryName: 'Poland',
        discord: null,
        totalScore: 100,
      },
    ]);
  });

  it('defaults missing city/country to empty strings and marks expelled/failed students inactive', async () => {
    mentorRepository.createQueryBuilder.mockReturnValue(createQb('getOne', { id: 8 }));
    const expelled = {
      ...mockStudentRecord,
      isExpelled: true,
      isFailed: false,
      user: { ...mockStudentRecord.user, cityName: null, countryName: null },
    };
    studentRepository.createQueryBuilder.mockReturnValue(createQb('getMany', [expelled]));

    const [student] = await service.getInterviewStudentsByMentor(5, 7, 'mentor-x');

    expect(student.cityName).toBe('');
    expect(student.countryName).toBe('');
    expect(student.isActive).toBe(false);
  });
});
