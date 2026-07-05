import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { CourseStudentsService } from './course-students.service';

// Fixtures mirrored from server/src/routes/course/__test__/studentsLists.test.ts to prove business-logic equivalence
const searchRecord = {
  id: 42,
  user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe' },
  mentor: { id: 8, user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x' } },
};

const csvRecord = {
  id: 42,
  isExpelled: false,
  isFailed: false,
  totalScore: 100,
  user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe', cityName: 'Warsaw', countryName: 'Poland' },
  mentor: { id: 8, user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x' } },
};

const studentRepository = { createQueryBuilder: vi.fn() };

const createQb = (rows: unknown[]) => {
  const qb = {
    select: vi.fn(),
    addSelect: vi.fn(),
    innerJoin: vi.fn(),
    leftJoin: vi.fn(),
    leftJoinAndSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getMany: vi.fn().mockResolvedValue(rows),
  };
  qb.select.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.innerJoin.mockReturnValue(qb);
  qb.leftJoin.mockReturnValue(qb);
  qb.leftJoinAndSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  qb.limit.mockReturnValue(qb);
  return qb;
};

describe('course students lists', () => {
  let service: CourseStudentsService;

  beforeEach(async () => {
    studentRepository.createQueryBuilder.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseStudentsService,
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Mentor), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();
    service = module.get(CourseStudentsService);
  });

  it('search: searches active students by prefix and maps mentors', async () => {
    const qb = createQb([searchRecord]);
    studentRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.searchCourseStudents(5, 'jo', true);

    expect(qb.where).toHaveBeenCalledWith('student.courseId = :courseId');
    expect(qb.andWhere).toHaveBeenCalledWith('student.isExpelled = false');
    expect(qb.andWhere).toHaveBeenCalledWith('mentor.id IS NULL');
    expect(qb.limit).toHaveBeenCalledWith(20);
    expect(result).toEqual([
      {
        id: 42,
        githubId: 'john-doe',
        name: 'John Doe',
        mentor: { id: 8, githubId: 'mentor-x', name: 'Mentor X' },
      },
    ]);
  });

  it('csv: maps students to flat rows', async () => {
    const qb = createQb([csvRecord]);
    studentRepository.createQueryBuilder.mockReturnValue(qb);

    const rows = await service.getStudentsForCsv(5, false);

    expect(rows).toEqual([
      {
        id: 42,
        githubId: 'john-doe',
        name: 'John Doe',
        isActive: true,
        mentorName: 'Mentor X',
        mentorGithubId: 'mentor-x',
        totalScore: 100,
        city: 'Warsaw',
        country: 'Poland',
      },
    ]);
  });

  it('details: applies the active-only filter and detail mapping', async () => {
    const detailedRecord = {
      ...csvRecord,
      stageInterviews: [{ id: 1, isCompleted: true }],
      taskChecker: [{ courseTask: { id: 7, task: { name: 'songbird' } } }],
      user: { ...csvRecord.user, discord: null },
    };
    const qb = createQb([detailedRecord]);
    studentRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getStudentsWithDetails(5, true);

    expect(qb.where).toHaveBeenCalledWith('course.id = :courseId AND student."isExpelled" = false', { courseId: 5 });
    expect(qb.orderBy).toHaveBeenCalledWith('student.totalScore', 'DESC');
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 42,
        githubId: 'john-doe',
        name: 'John Doe',
        isActive: true,
        interviews: [{ id: 1, isCompleted: true }],
        assignedChecks: [{ id: 7, name: 'songbird' }],
      }),
    );
  });
});
