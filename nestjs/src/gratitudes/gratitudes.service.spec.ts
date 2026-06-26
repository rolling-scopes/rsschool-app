import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Feedback } from '@entities/feedback';
import { CourseRole } from 'src/auth';
import type { AuthUser } from 'src/auth';
import { GratitudesService } from './gratitudes.service';
import { DiscordService } from './discord.service';
import { Badge } from './dto';

type QueryBuilderMock = {
  select: ReturnType<typeof vi.fn>;
  addSelect: ReturnType<typeof vi.fn>;
  innerJoin: ReturnType<typeof vi.fn>;
  leftJoinAndSelect: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  andWhere: ReturnType<typeof vi.fn>;
  from: ReturnType<typeof vi.fn>;
  groupBy: ReturnType<typeof vi.fn>;
  addGroupBy: ReturnType<typeof vi.fn>;
  orderBy: ReturnType<typeof vi.fn>;
  addOrderBy: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  offset: ReturnType<typeof vi.fn>;
  setParameters: ReturnType<typeof vi.fn>;
  getRawOne: ReturnType<typeof vi.fn>;
  getRawMany: ReturnType<typeof vi.fn>;
  getQuery: ReturnType<typeof vi.fn>;
  getParameters: ReturnType<typeof vi.fn>;
};

// Fluent QueryBuilder mock: every chainable method returns the builder itself,
// while terminal methods (getRawOne/getRawMany/getQuery/getParameters) are
// stubbed per-test. Mirrors the lighter helpers in gratitudes-list.spec.ts but
// generalized so getHeroesRadar's long chains resolve cleanly. Cast to the
// concrete builder type at injection points where the service expects one.
const createQueryBuilderMock = (): QueryBuilderMock => {
  const qb = {} as QueryBuilderMock;
  const chainMethods: (keyof QueryBuilderMock)[] = [
    'select',
    'addSelect',
    'innerJoin',
    'leftJoinAndSelect',
    'where',
    'andWhere',
    'from',
    'groupBy',
    'addGroupBy',
    'orderBy',
    'addOrderBy',
    'limit',
    'offset',
    'setParameters',
  ];
  chainMethods.forEach(method => {
    qb[method] = vi.fn().mockReturnValue(qb);
  });
  qb.getRawOne = vi.fn();
  qb.getRawMany = vi.fn();
  qb.getQuery = vi.fn().mockReturnValue('SELECT *');
  qb.getParameters = vi.fn().mockReturnValue({});
  return qb;
};

// Type-erased helper for feeding the mock builder where a real QueryBuilder is expected.
const asQb = (qb: QueryBuilderMock) => qb as unknown as never;

const mockRepository = {
  createQueryBuilder: vi.fn(),
  save: vi.fn(),
  findOneOrFail: vi.fn(),
} as Partial<Repository<Feedback>> as Repository<Feedback>;

const mockDataSource = {
  createQueryBuilder: vi.fn(),
} as Partial<DataSource> as DataSource;

const mockDiscordService = {
  sendGratitudeMessage: vi.fn(),
} as Partial<DiscordService> as DiscordService;

// Minimal AuthUser shapes; only id/courses/isAdmin are read by the service.
const adminUser = { id: 1, isAdmin: true, courses: {} } as Partial<AuthUser> as AuthUser;

const regularUser = {
  id: 10,
  isAdmin: false,
  courses: { 100: { roles: [CourseRole.Student] } },
} as Partial<AuthUser> as AuthUser;

const managerUser = {
  id: 11,
  isAdmin: false,
  courses: { 100: { roles: [CourseRole.Manager] } },
} as Partial<AuthUser> as AuthUser;

const supervisorUser = {
  id: 12,
  isAdmin: false,
  courses: { 100: { roles: [CourseRole.Supervisor] } },
} as Partial<AuthUser> as AuthUser;

describe('GratitudesService', () => {
  let service: GratitudesService;
  let repository: Mocked<Repository<Feedback>>;
  let dataSource: Mocked<DataSource>;
  let discordService: Mocked<DiscordService>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GratitudesService,
        { provide: DiscordService, useValue: mockDiscordService },
        { provide: getRepositoryToken(Feedback), useValue: mockRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<GratitudesService>(GratitudesService);
    repository = module.get(getRepositoryToken(Feedback));
    dataSource = module.get(DataSource);
    discordService = module.get(DiscordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBadges', () => {
    it('returns every badge for an admin regardless of course roles', () => {
      const badges = service.getBadges(adminUser, 100);

      // All 16 badges from the gratitudeBadge catalog are returned.
      expect(badges).toHaveLength(16);
      expect(badges.map(b => b.id)).toContain(Badge.Mentor);
      expect(badges.map(b => b.id)).toContain(Badge.RSActivist);
    });

    it('returns only role-free badges for a student (no privileged roles)', () => {
      const badges = service.getBadges(regularUser, 100);

      // 7 badges have no `roles` restriction and are always allowed.
      expect(badges).toHaveLength(7);
      const ids = badges.map(b => b.id);
      expect(ids).toEqual([
        Badge.Congratulations,
        Badge.ExpertHelp,
        Badge.GreatSpeaker,
        Badge.GoodJob,
        Badge.HelpingHand,
        Badge.Hero,
        Badge.ThankYou,
      ]);
      expect(ids).not.toContain(Badge.Mentor);
    });

    it('includes Manager+Supervisor badges for a manager', () => {
      const badges = service.getBadges(managerUser, 100);
      const ids = badges.map(b => b.id);

      expect(ids).toContain(Badge.OutstandingWork);
      expect(ids).toContain(Badge.RSActivist);
      // Manager-only badges are present for a manager.
      expect(ids).toContain(Badge.Mentor);
      expect(ids).toContain(Badge.Thanks);
    });

    it('includes shared Manager/Supervisor badges but excludes Manager-only badges for a supervisor', () => {
      const badges = service.getBadges(supervisorUser, 100);
      const ids = badges.map(b => b.id);

      // Shared between Manager and Supervisor.
      expect(ids).toContain(Badge.OutstandingWork);
      expect(ids).toContain(Badge.JobOffer);
      // Manager-only badges must NOT appear for a supervisor.
      expect(ids).not.toContain(Badge.Mentor);
      expect(ids).not.toContain(Badge.Contributor);
      expect(ids).not.toContain(Badge.Coordinator);
      expect(ids).not.toContain(Badge.Thanks);
    });

    it('returns only role-free badges when the user has no entry for the course', () => {
      const badges = service.getBadges(regularUser, 999);

      expect(badges).toHaveLength(7);
      expect(badges.every(b => b.id !== Badge.Mentor)).toBe(true);
    });

    it('treats an undefined courses map as no roles', () => {
      const userWithoutCourses = { id: 5, isAdmin: false, courses: undefined } as Partial<AuthUser> as AuthUser;

      const badges = service.getBadges(userWithoutCourses, 100);

      expect(badges).toHaveLength(7);
    });
  });

  describe('create', () => {
    const validData = {
      userIds: [20, 21],
      courseId: 100,
      comment: 'Thank you so much for the help',
      badgeId: Badge.ThankYou,
    };

    it('throws BadRequestException when giving feedback to yourself', async () => {
      const selfData = { ...validData, userIds: [regularUser.id] };

      await expect(service.create(regularUser, selfData)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.create(regularUser, selfData)).rejects.toThrow('You cannot give feedback to yourself');
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when own id appears among multiple recipients', async () => {
      const selfData = { ...validData, userIds: [20, regularUser.id, 21] };

      await expect(service.create(regularUser, selfData)).rejects.toThrow('You cannot give feedback to yourself');
    });

    it('throws BadRequestException when the badge is not allowed for the user role', async () => {
      // A student cannot grant the Manager-only Mentor badge.
      const data = { ...validData, badgeId: Badge.Mentor };

      await expect(service.create(regularUser, data)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.create(regularUser, data)).rejects.toThrow('Badge not allowed');
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the badgeId does not exist in the catalog', async () => {
      const data = { ...validData, badgeId: 'Nonexistent_badge' };

      await expect(service.create(regularUser, data)).rejects.toThrow('Badge not allowed');
    });

    it('persists feedback for each recipient and posts to discord when a webhook URL exists', async () => {
      const savedFeedback = { course: { discordServer: { gratitudeUrl: 'https://hook' } } };
      repository.save.mockImplementation(((entity: Partial<Feedback>) => ({ id: 999, ...entity })) as never);
      repository.findOneOrFail.mockImplementation(
        (({ where }: { where: { id: number } }) =>
          ({
            id: where.id,
            comment: 'Thank you so much for the help',
            toUser: { githubId: 'recipient', discord: { id: 'disc-1' } },
            fromUser: { githubId: 'sender' },
            ...savedFeedback,
          }) as unknown as Feedback) as never,
      );
      discordService.sendGratitudeMessage.mockResolvedValue(undefined);

      await service.create(regularUser, validData);

      // One save + one findOneOrFail per recipient.
      expect(repository.save).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalledWith({
        fromUserId: regularUser.id,
        toUserId: 20,
        comment: validData.comment,
        badgeId: Badge.ThankYou,
        courseId: 100,
      });
      expect(repository.save).toHaveBeenCalledWith({
        fromUserId: regularUser.id,
        toUserId: 21,
        comment: validData.comment,
        badgeId: Badge.ThankYou,
        courseId: 100,
      });
      expect(repository.findOneOrFail).toHaveBeenCalledTimes(2);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['fromUser', 'toUser', 'course', 'course.discordServer'],
      });
      expect(discordService.sendGratitudeMessage).toHaveBeenCalledTimes(2);
      expect(discordService.sendGratitudeMessage).toHaveBeenCalledWith({
        toGithubId: 'recipient',
        toDiscordId: 'disc-1',
        fromGithubId: 'sender',
        comment: 'Thank you so much for the help',
        gratitudeUrl: 'https://hook',
      });
    });

    it('skips discord and warns when the course has no discord webhook URL', async () => {
      repository.save.mockResolvedValue({ id: 1 } as Feedback);
      repository.findOneOrFail.mockResolvedValue({
        id: 1,
        comment: 'c',
        toUser: { githubId: 'recipient' },
        fromUser: { githubId: 'sender' },
        course: undefined,
      } as unknown as Feedback);
      const warnSpy = vi.spyOn((service as unknown as { logger: { warn: (m: string) => void } }).logger, 'warn');

      await service.create(regularUser, { ...validData, userIds: [20] });

      expect(discordService.sendGratitudeMessage).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith('Course do not have Discord Webhook URL');
    });

    it('passes a null discord id when the recipient has no linked discord account', async () => {
      repository.save.mockResolvedValue({ id: 7 } as Feedback);
      repository.findOneOrFail.mockResolvedValue({
        id: 7,
        comment: null,
        toUser: { githubId: 'recipient', discord: null },
        fromUser: { githubId: 'sender' },
        course: { discordServer: { gratitudeUrl: 'https://hook' } },
      } as unknown as Feedback);
      discordService.sendGratitudeMessage.mockResolvedValue(undefined);

      await service.create(regularUser, { ...validData, userIds: [20] });

      expect(discordService.sendGratitudeMessage).toHaveBeenCalledWith({
        toGithubId: 'recipient',
        toDiscordId: null,
        fromGithubId: 'sender',
        // Null comment is coalesced to an empty string before sending.
        comment: '',
        gratitudeUrl: 'https://hook',
      });
    });

    it('allows an admin to grant any badge', async () => {
      repository.save.mockResolvedValue({ id: 3 } as Feedback);
      repository.findOneOrFail.mockResolvedValue({
        id: 3,
        comment: 'c',
        toUser: { githubId: 'r' },
        fromUser: { githubId: 's' },
        course: undefined,
      } as unknown as Feedback);

      await expect(
        service.create(adminUser, { ...validData, userIds: [20], badgeId: Badge.Mentor }),
      ).resolves.toBeUndefined();
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHeroesRadar', () => {
    let countQb: ReturnType<typeof createQueryBuilderMock>;
    let countedBadgesQb: ReturnType<typeof createQueryBuilderMock>;
    let heroesQb: ReturnType<typeof createQueryBuilderMock>;

    beforeEach(() => {
      countQb = createQueryBuilderMock();
      countedBadgesQb = createQueryBuilderMock();
      heroesQb = createQueryBuilderMock();
      // Repo builds countQuery first, then countedBadgesQuery (plus optional
      // activist sub-query). DataSource builds the outer heroesQuery.
      repository.createQueryBuilder.mockReturnValueOnce(asQb(countQb)).mockReturnValueOnce(asQb(countedBadgesQb));
      dataSource.createQueryBuilder.mockReturnValue(asQb(heroesQb));
      countQb.getRawOne.mockResolvedValue({ count: '3' });
      heroesQb.getRawMany.mockResolvedValue([
        { githubId: 'hero1', firstName: 'A', lastName: 'B', total: '5', badges: [] },
      ]);
    });

    it('returns heroes and paging meta for a minimal query', async () => {
      const result = await service.getHeroesRadar({ current: 1, pageSize: 20 });

      expect(result.heroes).toHaveLength(1);
      expect(result.meta).toEqual({
        itemCount: 1,
        total: 3,
        current: 1,
        pageSize: 20,
        totalPages: 1, // ceil(3 / 20)
      });
      // No optional filters applied -> no where() on the count/badges builders.
      expect(countQb.where).not.toHaveBeenCalled();
      expect(countedBadgesQb.where).not.toHaveBeenCalled();
    });

    it('defaults current to 1 and pageSize to 20 when omitted', async () => {
      await service.getHeroesRadar({} as Parameters<typeof service.getHeroesRadar>[0]);

      // offset = (1 - 1) * 20 = 0, limit = 20.
      expect(heroesQb.limit).toHaveBeenCalledWith(20);
      expect(heroesQb.offset).toHaveBeenCalledWith(0);
    });

    it('computes offset from the requested page and pageSize', async () => {
      await service.getHeroesRadar({ current: 3, pageSize: 10 });

      expect(heroesQb.limit).toHaveBeenCalledWith(10);
      expect(heroesQb.offset).toHaveBeenCalledWith(20); // (3 - 1) * 10
    });

    it('excludes activist recipients when notActivist is set', async () => {
      const activistQb = createQueryBuilderMock();
      activistQb.getRawMany.mockResolvedValue([{ toUserId: 50 }, { toUserId: 51 }]);
      // getUserIdsWithActivistBadge builds its own query builder first.
      repository.createQueryBuilder.mockReset();
      repository.createQueryBuilder
        .mockReturnValueOnce(asQb(countQb))
        .mockReturnValueOnce(asQb(countedBadgesQb))
        .mockReturnValueOnce(asQb(activistQb));

      await service.getHeroesRadar({ current: 1, pageSize: 20, notActivist: true });

      expect(activistQb.where).toHaveBeenCalledWith(`"badgeId" = 'RS_activist'`);
      expect(countQb.where).toHaveBeenCalledWith('"feedback"."toUserId" NOT IN (:...ids)', { ids: [50, 51] });
      expect(countedBadgesQb.where).toHaveBeenCalledWith('"feedback"."toUserId" NOT IN (:...ids)', { ids: [50, 51] });
    });

    it('filters by courseId when provided', async () => {
      await service.getHeroesRadar({ current: 1, pageSize: 20, courseId: 100 });

      expect(countQb.where).toHaveBeenCalledWith('feedback."courseId" = :courseId', { courseId: 100 });
      expect(countedBadgesQb.where).toHaveBeenCalledWith('feedback."courseId" = :courseId', { courseId: 100 });
    });

    it('filters by countryName when provided', async () => {
      await service.getHeroesRadar({ current: 1, pageSize: 20, countryName: 'Poland' });

      expect(countQb.where).toHaveBeenCalledWith('"user"."countryName" = :countryName', { countryName: 'Poland' });
      expect(countedBadgesQb.where).toHaveBeenCalledWith('"user"."countryName" = :countryName', {
        countryName: 'Poland',
      });
    });

    it('filters by a date range only when both startDate and endDate are present', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-02-01');

      await service.getHeroesRadar({ current: 1, pageSize: 20, startDate, endDate });

      expect(countQb.where).toHaveBeenCalledWith('feedback."createdDate" BETWEEN :startDate and :endDate', {
        startDate,
        endDate,
      });
      expect(countedBadgesQb.where).toHaveBeenCalledWith('feedback."createdDate" BETWEEN :startDate and :endDate', {
        startDate,
        endDate,
      });
    });

    it('does not apply a date filter when only startDate is provided', async () => {
      await service.getHeroesRadar({ current: 1, pageSize: 20, startDate: new Date('2026-01-01') });

      expect(countQb.where).not.toHaveBeenCalled();
    });

    it('rounds totalPages up for a partial last page', async () => {
      countQb.getRawOne.mockResolvedValue({ count: '21' });

      const result = await service.getHeroesRadar({ current: 1, pageSize: 20 });

      expect(result.meta.total).toBe(21);
      expect(result.meta.totalPages).toBe(2); // ceil(21 / 20)
    });

    it('returns empty heroes and zero totals when there is no data', async () => {
      countQb.getRawOne.mockResolvedValue({ count: '0' });
      heroesQb.getRawMany.mockResolvedValue([]);

      const result = await service.getHeroesRadar({ current: 1, pageSize: 20 });

      expect(result.heroes).toEqual([]);
      expect(result.meta).toEqual({
        itemCount: 0,
        total: 0,
        current: 1,
        pageSize: 20,
        totalPages: 0,
      });
    });

    it('combines all optional filters together', async () => {
      const activistQb = createQueryBuilderMock();
      activistQb.getRawMany.mockResolvedValue([{ toUserId: 50 }]);
      repository.createQueryBuilder.mockReset();
      repository.createQueryBuilder
        .mockReturnValueOnce(asQb(countQb))
        .mockReturnValueOnce(asQb(countedBadgesQb))
        .mockReturnValueOnce(asQb(activistQb));
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-02-01');

      await service.getHeroesRadar({
        current: 2,
        pageSize: 5,
        notActivist: true,
        courseId: 100,
        countryName: 'Poland',
        startDate,
        endDate,
      });

      expect(countQb.where).toHaveBeenCalledWith('"feedback"."toUserId" NOT IN (:...ids)', { ids: [50] });
      expect(countQb.where).toHaveBeenCalledWith('feedback."courseId" = :courseId', { courseId: 100 });
      expect(countQb.where).toHaveBeenCalledWith('"user"."countryName" = :countryName', { countryName: 'Poland' });
      expect(countQb.where).toHaveBeenCalledWith('feedback."createdDate" BETWEEN :startDate and :endDate', {
        startDate,
        endDate,
      });
      expect(heroesQb.offset).toHaveBeenCalledWith(5); // (2 - 1) * 5
    });
  });

  describe('getHeroesCountries', () => {
    it('returns distinct, non-null country names ordered ascending', async () => {
      const qb = createQueryBuilderMock();
      qb.getRawMany.mockResolvedValue([{ countryName: 'Belarus' }, { countryName: 'Poland' }]);
      repository.createQueryBuilder.mockReturnValue(asQb(qb));

      const result = await service.getHeroesCountries();

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('feedback');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('feedback.fromUser', 'user');
      expect(qb.select).toHaveBeenCalledWith('DISTINCT "countryName"');
      expect(qb.where).toHaveBeenCalledWith('"countryName" IS NOT NULL');
      expect(qb.orderBy).toHaveBeenCalledWith('"countryName"', 'ASC');
      expect(result).toEqual([{ countryName: 'Belarus' }, { countryName: 'Poland' }]);
    });

    it('returns an empty list when no countries match', async () => {
      const qb = createQueryBuilderMock();
      qb.getRawMany.mockResolvedValue([]);
      repository.createQueryBuilder.mockReturnValue(asQb(qb));

      const result = await service.getHeroesCountries();

      expect(result).toEqual([]);
    });
  });
});
