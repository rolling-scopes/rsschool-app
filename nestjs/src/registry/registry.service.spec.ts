import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MentorRegistry } from '@entities/mentorRegistry';
import { Student } from '@entities/student';
import { Registry } from '@entities/registry';
import { Mentor } from '@entities/mentor';
import { User } from '@entities/user';
import { Course } from '@entities/course';
import { RegistryService } from './registry.service';
import { MentorRegistryTabsMode } from './registry.controller';
import { UsersService } from 'src/users/users.service';
import { CoursesService } from 'src/courses/courses.service';
import { NotificationsService } from 'src/notifications/notifications.service';

// Fluent QueryBuilder mock: records calls per method, supports Brackets callbacks and paginate's take/skip/getManyAndCount.
function createFakeQueryBuilder(items: unknown[] = [], total = 0) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of [
    'innerJoin',
    'addSelect',
    'leftJoin',
    'where',
    'andWhere',
    'orWhere',
    'orderBy',
    'select',
    'distinct',
    'take',
    'skip',
  ]) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getMany = vi.fn(async () => items);
  qb.getManyAndCount = vi.fn(async () => [items, total]);
  qb.getRawMany = vi.fn(async () => items);
  return { qb, calls };
}

const mentorsRegistryRepository = { createQueryBuilder: vi.fn(), update: vi.fn(), findOne: vi.fn() };
const studentRepository = { createQueryBuilder: vi.fn() };
const mockGetByGithubId = vi.fn();
const mockGetByIds = vi.fn();
const mockSendMessage = vi.fn();

describe('RegistryService (uncovered methods)', () => {
  let service: RegistryService;

  beforeEach(async () => {
    Object.values(mentorsRegistryRepository).forEach(fn => fn.mockReset());
    Object.values(studentRepository).forEach(fn => fn.mockReset());
    mockGetByGithubId.mockReset();
    mockGetByIds.mockReset();
    mockSendMessage.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        { provide: getRepositoryToken(MentorRegistry), useValue: mentorsRegistryRepository },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Registry), useValue: {} },
        { provide: getRepositoryToken(Mentor), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: UsersService, useValue: { getByGithubId: mockGetByGithubId } },
        { provide: CoursesService, useValue: { getByIds: mockGetByIds } },
        { provide: NotificationsService, useValue: { sendMessage: mockSendMessage } },
      ],
    }).compile();

    service = module.get(RegistryService);
  });

  describe('approveMentor', () => {
    it('updates the registry with preselected courses and a fresh send date, returning the user', async () => {
      const user = { id: 11, githubId: 'john-doe' };
      mockGetByGithubId.mockResolvedValue(user);
      mentorsRegistryRepository.update.mockResolvedValue({});

      const result = await service.approveMentor('john-doe', ['10', '20']);

      expect(mockGetByGithubId).toHaveBeenCalledWith('john-doe');
      expect(mentorsRegistryRepository.update).toHaveBeenCalledWith(
        { userId: 11 },
        { preselectedCourses: ['10', '20'], sendDate: expect.any(Date) },
      );
      expect(result).toBe(user);
    });

    it('throws BadRequestException when the user is not found', async () => {
      mockGetByGithubId.mockResolvedValue(null);

      await expect(service.approveMentor('ghost', ['10'])).rejects.toThrow(BadRequestException);
      await expect(service.approveMentor('ghost', ['10'])).rejects.toThrow('User not found');
      expect(mentorsRegistryRepository.update).not.toHaveBeenCalled();
    });

    it('throws when getByGithubId resolves to undefined (falsy guard)', async () => {
      mockGetByGithubId.mockResolvedValue(undefined);

      await expect(service.approveMentor('ghost', [])).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelMentorRegistry', () => {
    it('flags the registry as canceled for the resolved user', async () => {
      mockGetByGithubId.mockResolvedValue({ id: 11 });
      mentorsRegistryRepository.update.mockResolvedValue({});

      await service.cancelMentorRegistry('john-doe');

      expect(mentorsRegistryRepository.update).toHaveBeenCalledWith({ userId: 11 }, { canceled: true });
    });

    it('throws BadRequestException when the user is null', async () => {
      mockGetByGithubId.mockResolvedValue(null);

      await expect(service.cancelMentorRegistry('ghost')).rejects.toThrow(BadRequestException);
      expect(mentorsRegistryRepository.update).not.toHaveBeenCalled();
    });

    it('treats undefined user as not found via the == null check', async () => {
      mockGetByGithubId.mockResolvedValue(undefined);

      await expect(service.cancelMentorRegistry('ghost')).rejects.toThrow('User not found');
    });
  });

  describe('commentMentorRegistry', () => {
    it('writes the comment for the resolved user', async () => {
      mockGetByGithubId.mockResolvedValue({ id: 11 });
      mentorsRegistryRepository.update.mockResolvedValue({});

      await service.commentMentorRegistry('john-doe', 'great mentor');

      expect(mentorsRegistryRepository.update).toHaveBeenCalledWith({ userId: 11 }, { comment: 'great mentor' });
    });

    it('coerces a null comment to undefined when clearing it', async () => {
      mockGetByGithubId.mockResolvedValue({ id: 11 });
      mentorsRegistryRepository.update.mockResolvedValue({});

      await service.commentMentorRegistry('john-doe', null);

      expect(mentorsRegistryRepository.update).toHaveBeenCalledWith({ userId: 11 }, { comment: undefined });
    });

    it('throws BadRequestException when the user is missing', async () => {
      mockGetByGithubId.mockResolvedValue(null);

      await expect(service.commentMentorRegistry('ghost', 'x')).rejects.toThrow(BadRequestException);
      expect(mentorsRegistryRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('buildMentorApprovalData', () => {
    it('parses string course ids to numbers and returns the resolved courses', async () => {
      const courses = [{ id: 10 }, { id: 20 }];
      mockGetByIds.mockResolvedValue(courses);

      const result = await service.buildMentorApprovalData(['10', '20']);

      expect(mockGetByIds).toHaveBeenCalledWith([10, 20]);
      expect(result).toEqual({ courses });
    });

    it('handles an empty preselected list', async () => {
      mockGetByIds.mockResolvedValue([]);

      const result = await service.buildMentorApprovalData([]);

      expect(mockGetByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual({ courses: [] });
    });
  });

  describe('getOwnMentorRegistry', () => {
    it('looks up the registry by userId', async () => {
      const registry = { id: 7, userId: 11 };
      mentorsRegistryRepository.findOne.mockResolvedValue(registry);

      const result = await service.getOwnMentorRegistry(11);

      expect(mentorsRegistryRepository.findOne).toHaveBeenCalledWith({ where: { userId: 11 } });
      expect(result).toBe(registry);
    });

    it('returns null when no registry exists', async () => {
      mentorsRegistryRepository.findOne.mockResolvedValue(null);

      const result = await service.getOwnMentorRegistry(99);

      expect(result).toBeNull();
    });
  });

  describe('findAllMentorRegistries', () => {
    it('builds the prepared query and filters out canceled registries', async () => {
      const rows = [{ id: 1 }];
      const { qb, calls } = createFakeQueryBuilder(rows);
      mentorsRegistryRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllMentorRegistries();

      expect(calls.andWhere).toEqual([['mentorRegistry.canceled = false']]);
      expect(qb.getMany).toHaveBeenCalled();
      expect(result).toBe(rows);
    });
  });

  describe('filterMentorRegistries', () => {
    const baseArgs = {
      page: 1,
      limit: 10,
      status: MentorRegistryTabsMode.All,
    };

    function setupQuery(items: unknown[] = [], total = 0) {
      const { qb, calls } = createFakeQueryBuilder(items, total);
      mentorsRegistryRepository.createQueryBuilder.mockReturnValue(qb);
      return { qb, calls };
    }

    it('applies only the canceled filter when no optional filters are provided', async () => {
      const { calls } = setupQuery([{ id: 1 }], 1);

      const result = await service.filterMentorRegistries(baseArgs);

      // canceled filter is the only andWhere; no githubId/cityName/etc. branches taken
      expect(calls.andWhere).toEqual([['mentorRegistry.canceled = false']]);
      expect(result).toEqual({ total: 1, mentors: [{ id: 1 }] });
    });

    it('adds an ILIKE filter for githubId', async () => {
      const { calls } = setupQuery();

      await service.filterMentorRegistries({ ...baseArgs, githubId: 'john' });

      expect(calls.andWhere).toContainEqual([`"user"."githubId" ILIKE :githubId`, { githubId: '%john%' }]);
    });

    it('adds an ILIKE filter for cityName', async () => {
      const { calls } = setupQuery();

      await service.filterMentorRegistries({ ...baseArgs, cityName: 'Minsk' });

      expect(calls.andWhere).toContainEqual([`"user"."cityName" ILIKE :cityName`, { cityName: '%Minsk%' }]);
    });

    it('adds an EXISTS filter for preselectedCourses when non-empty', async () => {
      const { calls } = setupQuery();

      await service.filterMentorRegistries({ ...baseArgs, preselectedCourses: [1, 2] });

      const call = calls.andWhere.find(([sql]) => typeof sql === 'string' && sql.includes('preselectedCourses'));
      expect(call).toBeDefined();
      expect(call?.[1]).toEqual({ preselectedCourses: [1, 2] });
    });

    it('skips the preselectedCourses filter when the array is empty', async () => {
      const { calls } = setupQuery();

      await service.filterMentorRegistries({ ...baseArgs, preselectedCourses: [] });

      expect(calls.andWhere).toEqual([['mentorRegistry.canceled = false']]);
    });

    it('adds an EXISTS filter for preferedCourses when non-empty', async () => {
      const { calls } = setupQuery();

      await service.filterMentorRegistries({ ...baseArgs, preferedCourses: [3] });

      const call = calls.andWhere.find(
        ([sql]) => typeof sql === 'string' && sql.includes('preferedCourses') && !sql.includes('&&'),
      );
      expect(call?.[1]).toEqual({ preferedCourses: [3] });
    });

    it('adds an EXISTS filter for technicalMentoring when non-empty', async () => {
      const { calls } = setupQuery();

      await service.filterMentorRegistries({ ...baseArgs, technicalMentoring: ['nodejs'] });

      const call = calls.andWhere.find(([sql]) => typeof sql === 'string' && sql.includes('technicalMentoring'));
      expect(call?.[1]).toEqual({ technicalMentoring: ['nodejs'] });
    });

    it('builds a Brackets group binding coursesIds when only coursesIds is provided', async () => {
      const { qb, calls } = setupQuery();
      // Brackets is invoked with a sub-builder; run the callback against qb to record where/orWhere.
      const bracketsArg = await runFilterAndExtractBrackets(service, { ...baseArgs, coursesIds: [5] }, qb, calls);

      expect(bracketsArg).toBeDefined();
      const whereCall = calls.where.find(([sql]) => typeof sql === 'string' && sql.includes('&&'));
      expect(whereCall?.[1]).toEqual({ coursesIds: [5] });
      // orWhere (disciplineNames branch) must not fire
      expect(calls.orWhere ?? []).toEqual([]);
    });

    it('builds a Brackets group binding disciplineNames when only disciplineNames is provided', async () => {
      const { qb, calls } = setupQuery();
      await runFilterAndExtractBrackets(service, { ...baseArgs, disciplineNames: ['frontend'] }, qb, calls);

      const orWhereCall = calls.orWhere?.find(([sql]) => typeof sql === 'string' && sql.includes('technicalMentoring'));
      expect(orWhereCall?.[1]).toEqual({ disciplineNames: ['frontend'] });
      // where (coursesIds branch) must not fire inside the brackets
      expect((calls.where ?? []).some(([sql]) => typeof sql === 'string' && sql.includes('&&'))).toBe(false);
    });

    it('builds a Brackets group binding both coursesIds and disciplineNames', async () => {
      const { qb, calls } = setupQuery();
      await runFilterAndExtractBrackets(
        service,
        { ...baseArgs, coursesIds: [5], disciplineNames: ['frontend'] },
        qb,
        calls,
      );

      expect(calls.where.some(([sql]) => typeof sql === 'string' && sql.includes('&&'))).toBe(true);
      expect(calls.orWhere?.some(([sql]) => typeof sql === 'string' && sql.includes('technicalMentoring'))).toBe(true);
    });

    it('adds the New-tab Brackets filter only when status is New', async () => {
      const { qb, calls } = setupQuery();

      await runFilterAndExtractBrackets(service, { ...baseArgs, status: MentorRegistryTabsMode.New }, qb, calls);

      // The New branch produces a where on empty preselectedCourses + an orWhere on the mentor count subquery.
      expect(calls.where?.some(([sql]) => sql === `mentorRegistry.preselectedCourses = ''`)).toBe(true);
      expect(calls.orWhere?.some(([sql]) => typeof sql === 'string' && sql.includes('cardinality'))).toBe(true);
    });

    it('does not add the New-tab filter when status is All', async () => {
      const { qb, calls } = setupQuery();

      await runFilterAndExtractBrackets(service, { ...baseArgs, status: MentorRegistryTabsMode.All }, qb, calls);

      expect(calls.where?.some(([sql]) => sql === `mentorRegistry.preselectedCourses = ''`)).toBeFalsy();
    });

    it('paginates and maps the response into { total, mentors }', async () => {
      const items = [{ id: 1 }, { id: 2 }];
      const { qb } = setupQuery(items, 42);

      const result = await service.filterMentorRegistries({ ...baseArgs, page: 2, limit: 5 });

      expect(qb.take).toHaveBeenCalledWith(5);
      expect(qb.skip).toHaveBeenCalledWith(5); // (2 - 1) * 5
      expect(result).toEqual({ total: 42, mentors: items });
    });
  });

  describe('sendInvitationsToMentors', () => {
    it('builds the student/notification query, omitting the mentor join when isMentor is false', async () => {
      const { qb, calls } = createFakeQueryBuilder([]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      await service.sendInvitationsToMentors({ text: 'hi', disciplines: ['1', '2'], isMentor: false });

      expect(calls.where).toContainEqual(['discipline.id IN (:...ids)', { ids: ['1', '2'] }]);
      expect(calls.distinct).toEqual([[true]]);
      // mentor join is only added when isMentor is truthy
      const mentorJoin = (calls.innerJoin ?? []).find(args => args[0] === 'mentor');
      expect(mentorJoin).toBeUndefined();
    });

    it('adds the mentor inner join when isMentor is true', async () => {
      const { qb, calls } = createFakeQueryBuilder([]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      await service.sendInvitationsToMentors({ text: 'hi', disciplines: ['1'], isMentor: true });

      const mentorJoin = (calls.innerJoin ?? []).find(args => args[0] === 'mentor');
      expect(mentorJoin).toEqual(['mentor', 'mentor', 'mentor.userId = student.userId']);
    });

    it('dispatches mentorsInvitation emails for each fetched user in the background', async () => {
      const rows = [
        { student_userId: 1, notification_externalId: 'a@x.com' },
        { student_userId: 2, notification_externalId: 'b@x.com' },
      ];
      const { qb } = createFakeQueryBuilder(rows);
      studentRepository.createQueryBuilder.mockReturnValue(qb);
      mockSendMessage.mockResolvedValue(undefined);

      await service.sendInvitationsToMentors({ text: 'welcome', disciplines: ['1'], isMentor: false });
      await flushBackgroundWork();

      expect(mockSendMessage).toHaveBeenCalledTimes(2);
      expect(mockSendMessage).toHaveBeenCalledWith({
        notificationId: 'mentorsInvitation',
        userId: 1,
        data: { text: 'welcome' },
        channelId: 'email',
        channelValue: 'a@x.com',
        noEscape: true,
      });
    });

    it('swallows per-user send failures so the batch keeps going', async () => {
      const rows = [
        { student_userId: 1, notification_externalId: 'a@x.com' },
        { student_userId: 2, notification_externalId: 'b@x.com' },
      ];
      const { qb } = createFakeQueryBuilder(rows);
      studentRepository.createQueryBuilder.mockReturnValue(qb);
      mockSendMessage.mockRejectedValueOnce(new Error('smtp down')).mockResolvedValueOnce(undefined);

      await service.sendInvitationsToMentors({ text: 'welcome', disciplines: ['1'], isMentor: false });
      await flushBackgroundWork();

      // both attempted; the rejection did not abort the second send
      expect(mockSendMessage).toHaveBeenCalledTimes(2);
    });

    it('processes users in batches of 10', async () => {
      const rows = Array.from({ length: 23 }, (_, i) => ({
        student_userId: i + 1,
        notification_externalId: `u${i + 1}@x.com`,
      }));
      const { qb } = createFakeQueryBuilder(rows);
      studentRepository.createQueryBuilder.mockReturnValue(qb);
      mockSendMessage.mockResolvedValue(undefined);

      await service.sendInvitationsToMentors({ text: 'welcome', disciplines: ['1'], isMentor: false });
      await flushBackgroundWork();

      expect(mockSendMessage).toHaveBeenCalledTimes(23);
    });
  });
});

// filterMentorRegistries passes Brackets instances to andWhere; this helper invokes those callbacks
// against the shared qb so the inner where/orWhere calls are recorded for assertions.
async function runFilterAndExtractBrackets(
  service: RegistryService,
  args: Parameters<RegistryService['filterMentorRegistries']>[0],
  qb: any,
  calls: Record<string, unknown[][]>,
) {
  await service.filterMentorRegistries(args);
  const bracketsArgs = (calls.andWhere ?? [])
    .map(([arg]) => arg)
    .filter((arg: any) => arg && typeof arg.whereFactory === 'function');
  for (const brackets of bracketsArgs as any[]) {
    brackets.whereFactory(qb);
  }
  return bracketsArgs[0];
}

// sendInvitationsToMentors fires its work via Promise.resolve().then(...) without awaiting it;
// yielding a couple of microtasks lets the queued sends run before assertions.
async function flushBackgroundWork() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}
