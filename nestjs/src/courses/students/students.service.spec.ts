import { EntityNotFoundError } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '@entities/student';
import { StageInterview } from '@entities/index';
import { User } from '@entities/user';
import { Role, CourseRole, AuthUser } from '../../auth';
import { StudentsService } from './students.service';
import { UserStudentsQueryDto } from './dto';

// Fluent QueryBuilder mock. Chained methods return qb; clone returns a clone tracker;
// getQuery/getParameters back the subquery flow; getManyAndCount backs paginate().
const createUsersQb = (manyAndCount: [unknown[], number] = [[], 0]) => {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of [
    'innerJoin',
    'leftJoin',
    'select',
    'addSelect',
    'where',
    'orWhere',
    'addOrderBy',
    'setParameters',
    'take',
    'skip',
  ]) {
    qb[method] = vi.fn(() => qb);
  }
  // andWhere may receive a Brackets instance whose whereFactory builds nested conditions;
  // invoke it against a nested builder so those closures are exercised for coverage.
  qb.andWhere = vi.fn((arg: unknown) => {
    const factory = (arg as { whereFactory?: (b: unknown) => void })?.whereFactory;
    if (typeof factory === 'function') {
      const nested = { where: vi.fn(() => nested), orWhere: vi.fn(() => nested), andWhere: vi.fn(() => nested) };
      factory(nested);
    }
    return qb;
  });
  qb.clone = vi.fn(() => qb);
  qb.getQuery = vi.fn(() => 'SUBQUERY_SQL');
  qb.getParameters = vi.fn(() => ({ p: 1 }));
  qb.getManyAndCount = vi.fn(async () => manyAndCount);
  return qb;
};

const studentRepository = {
  findOneOrFail: vi.fn(),
  findOneBy: vi.fn(),
  update: vi.fn(),
};
const stageInterviewRepository = {
  find: vi.fn(),
};
const usersRepository = {
  createQueryBuilder: vi.fn(),
};

describe('StudentsService', () => {
  let service: StudentsService;

  beforeEach(async () => {
    [studentRepository, stageInterviewRepository, usersRepository].forEach(repo =>
      Object.values(repo).forEach(fn => (fn as ReturnType<typeof vi.fn>).mockReset()),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(StageInterview), useValue: stageInterviewRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
      ],
    }).compile();

    service = module.get(StudentsService);
  });

  describe('findUserStudents', () => {
    it('paginates with defaults (page 1, size 20) and no filters', async () => {
      const items = [{ id: 1 }];
      const qb = createUsersQb([items, 1]);
      usersRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findUserStudents({} as UserStudentsQueryDto);

      // paginate applies take(limit) and skip((page-1)*limit)
      expect(qb.take).toHaveBeenCalledWith(20);
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(result).toEqual({
        items,
        meta: { itemCount: 1, total: 1, current: 1, pageSize: 20, totalPages: 1 },
      });
    });

    it('honours explicit current/pageSize when paginating', async () => {
      const qb = createUsersQb([[], 50]);
      usersRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findUserStudents({ current: '3', pageSize: '10' } as UserStudentsQueryDto);

      expect(qb.take).toHaveBeenCalledWith(10);
      expect(qb.skip).toHaveBeenCalledWith(20); // (3 - 1) * 10
      expect(result.meta).toMatchObject({ current: 3, pageSize: 10, totalPages: 5 });
    });

    it('applies the student name search, building one Brackets per term', async () => {
      const qb = createUsersQb();
      usersRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findUserStudents({ student: 'john doe' } as UserStudentsQueryDto);

      // first query gets two Brackets (one per term) before the subquery rebuild
      expect(qb.andWhere).toHaveBeenCalled();
      // the final query wires the subquery sql + parameters
      expect(qb.where).toHaveBeenCalledWith('user.id IN (SUBQUERY_SQL)');
      expect(qb.setParameters).toHaveBeenCalledWith({ p: 1 });
      expect(qb.addOrderBy).toHaveBeenCalledWith('user.id', 'DESC');
    });

    it('applies country and city ILIKE filters', async () => {
      const qb = createUsersQb();
      usersRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findUserStudents({ country: 'Pol', city: 'War' } as UserStudentsQueryDto);

      expect(qb.andWhere).toHaveBeenCalledWith(`"user"."countryName" ILIKE :country`, { country: '%Pol%' });
      expect(qb.andWhere).toHaveBeenCalledWith(`"user"."cityName" ILIKE :city`, { city: '%War%' });
    });

    it('applies the ongoing-courses IN filter, parsing the comma list', async () => {
      const qb = createUsersQb();
      usersRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findUserStudents({ ongoingCourses: '1,2,3' } as UserStudentsQueryDto);

      expect(qb.andWhere).toHaveBeenCalledWith('student.courseId IN (:...onGoingCourseIds)', {
        onGoingCourseIds: [1, 2, 3],
      });
    });

    it('applies the previous-courses filter requiring a certificate', async () => {
      const qb = createUsersQb();
      usersRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findUserStudents({ previousCourses: '7,8' } as UserStudentsQueryDto);

      // the Brackets callback is invoked against a nested builder; assert the outer andWhere ran
      expect(qb.andWhere).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('delegates to findOneOrFail with the user relation', () => {
      const promise = Promise.resolve({ id: 1 } as Student);
      studentRepository.findOneOrFail.mockReturnValue(promise);

      const result = service.getById(1);

      expect(studentRepository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['user'] });
      expect(result).toBe(promise);
    });

    it('propagates EntityNotFoundError when the student is missing', async () => {
      studentRepository.findOneOrFail.mockRejectedValue(new EntityNotFoundError(Student, {}));

      await expect(service.getById(999)).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('canAccessStudent', () => {
    const buildUser = (overrides: Partial<AuthUser>): AuthUser =>
      ({ appRoles: [Role.User], courses: {}, ...overrides }) as AuthUser;

    it('denies when the student does not exist', async () => {
      studentRepository.findOneBy.mockResolvedValue(null);
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent(buildUser({}), 42);

      expect(result).toBe(false);
    });

    it('allows an app admin', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: null });
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent(buildUser({ appRoles: [Role.Admin] }), 42);

      expect(result).toBe(true);
    });

    it('allows a course manager', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: null });
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent(buildUser({ courses: { 5: { roles: [CourseRole.Manager] } } }), 42);

      expect(result).toBe(true);
    });

    it('allows a course supervisor', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: null });
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent(
        buildUser({ courses: { 5: { roles: [CourseRole.Supervisor] } } }),
        42,
      );

      expect(result).toBe(true);
    });

    it('allows a mentor who interviewed the student', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: 99 });
      stageInterviewRepository.find.mockResolvedValue([{ mentorId: 7 }]);

      const result = await service.canAccessStudent(
        buildUser({ courses: { 5: { roles: [CourseRole.Mentor], mentorId: 7 } } }),
        42,
      );

      expect(result).toBe(true);
    });

    it('denies a mentor when the student has no mentor assigned and no interview match', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: null });
      stageInterviewRepository.find.mockResolvedValue([{ mentorId: 8 }]);

      const result = await service.canAccessStudent(
        buildUser({ courses: { 5: { roles: [CourseRole.Mentor], mentorId: 7 } } }),
        42,
      );

      expect(result).toBe(false);
    });

    it('allows the assigned mentor of the student', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: 7 });
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent(
        buildUser({ courses: { 5: { roles: [CourseRole.Mentor], mentorId: 7 } } }),
        42,
      );

      expect(result).toBe(true);
    });

    it('denies an assigned mentor whose id differs from the student mentor', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: 7 });
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent(
        buildUser({ courses: { 5: { roles: [CourseRole.Mentor], mentorId: 8 } } }),
        42,
      );

      expect(result).toBe(false);
    });

    it('denies when the user has no info for the student course at all', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: 7 });
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent(buildUser({ courses: {} }), 42);

      expect(result).toBe(false);
    });

    it('handles a user without appRoles or courses (optional chaining)', async () => {
      studentRepository.findOneBy.mockResolvedValue({ id: 42, courseId: 5, mentorId: null });
      stageInterviewRepository.find.mockResolvedValue([]);

      const result = await service.canAccessStudent({} as AuthUser, 42);

      expect(result).toBe(false);
    });
  });

  describe('setMentor', () => {
    it('updates the student mentorId', async () => {
      await service.setMentor(42, 9);
      expect(studentRepository.update).toHaveBeenCalledWith(42, { mentorId: 9 });
    });
  });
});
