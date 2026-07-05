import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Feedback } from '@entities/feedback';
import { GratitudesService } from './gratitudes.service';
import { DiscordService } from './discord.service';

// Fixtures mirrored from server/src/routes/__test__/feedback.test.ts to prove business-logic equivalence
const mockRawRows = [
  {
    badgeId: 'Thank_you',
    date: '2026-01-15T10:00:00.000Z',
    comment: 'Great help',
    id: 5,
    githubId: 'john-doe',
    firstName: 'John',
    lastName: 'Doe',
    countryName: 'Poland',
    cityName: 'Warsaw',
    activist: false,
    user_id: 1,
    from: { githubId: 'jane', firstName: 'Jane', lastName: 'Dane' },
  },
];

const createCountQbMock = (count: string | null) => {
  const qb = {
    select: vi.fn(),
    from: vi.fn(),
    innerJoin: vi.fn(),
    andWhere: vi.fn(),
    getRawOne: vi.fn().mockResolvedValue({ count }),
  };
  qb.select.mockReturnValue(qb);
  qb.from.mockReturnValue(qb);
  qb.innerJoin.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

const createContentQbMock = (rows: unknown[]) => {
  const qb = {
    select: vi.fn(),
    addSelect: vi.fn(),
    innerJoin: vi.fn(),
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    getRawMany: vi.fn().mockResolvedValue(rows),
  };
  qb.select.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.innerJoin.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  qb.limit.mockReturnValue(qb);
  qb.offset.mockReturnValue(qb);
  return qb;
};

describe('GratitudesService.getGratitudes query contract', () => {
  let service: GratitudesService;
  const mockRepoCreateQueryBuilder = vi.fn();
  const mockDataSourceCreateQueryBuilder = vi.fn();

  beforeEach(async () => {
    mockRepoCreateQueryBuilder.mockReset();
    mockDataSourceCreateQueryBuilder.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GratitudesService,
        { provide: DiscordService, useValue: {} },
        { provide: getRepositoryToken(Feedback), useValue: { createQueryBuilder: mockRepoCreateQueryBuilder } },
        { provide: DataSource, useValue: { createQueryBuilder: mockDataSourceCreateQueryBuilder } },
      ],
    }).compile();

    service = module.get(GratitudesService);
  });

  it('counts gratitudes with toUser/fromUser joins and optional filters', async () => {
    const countQb = createCountQbMock('1');
    const contentQb = createContentQbMock(mockRawRows);
    mockDataSourceCreateQueryBuilder.mockReturnValue(countQb);
    mockRepoCreateQueryBuilder.mockReturnValue(contentQb);

    await service.getGratitudes({ githubId: 'john', name: 'Jo', courseId: 7 });

    expect(countQb.select).toHaveBeenCalledWith('COUNT(*)');
    expect(countQb.from).toHaveBeenCalledWith(Feedback, 'feedback');
    expect(countQb.innerJoin).toHaveBeenCalledWith('feedback.toUser', 'user');
    expect(countQb.innerJoin).toHaveBeenCalledWith('feedback.fromUser', 'fromUser');
    expect(countQb.andWhere).toHaveBeenCalledWith('"user"."githubId" ILIKE :githubId', { githubId: '%john%' });
    expect(countQb.andWhere).toHaveBeenCalledWith(
      '"user"."firstName" ILIKE :searchText OR "user"."lastName" ILIKE :searchText OR CONCAT("user"."firstName", \' \', "user"."lastName") ILIKE :searchText',
      { searchText: '%Jo%' },
    );
    expect(countQb.andWhere).toHaveBeenCalledWith('"feedback"."courseId" = :courseId', { courseId: 7 });
  });

  it('returns empty content without paging query when count is zero', async () => {
    const countQb = createCountQbMock(null);
    mockDataSourceCreateQueryBuilder.mockReturnValue(countQb);

    const result = await service.getGratitudes({});

    expect(result).toEqual({ count: 0, content: [] });
    expect(mockRepoCreateQueryBuilder).not.toHaveBeenCalled();
  });

  it('selects gratitude page with user fields, from-user object, ordered by updatedDate desc with default paging', async () => {
    const countQb = createCountQbMock('1');
    const contentQb = createContentQbMock(mockRawRows);
    mockDataSourceCreateQueryBuilder.mockReturnValue(countQb);
    mockRepoCreateQueryBuilder.mockReturnValue(contentQb);

    const result = await service.getGratitudes({});

    expect(mockRepoCreateQueryBuilder).toHaveBeenCalledWith('feedback');
    expect(contentQb.select).toHaveBeenCalledWith('feedback.badgeId', 'badgeId');
    expect(contentQb.addSelect).toHaveBeenCalledWith('feedback.updatedDate', 'date');
    expect(contentQb.addSelect).toHaveBeenCalledWith('feedback.comment', 'comment');
    expect(contentQb.addSelect).toHaveBeenCalledWith('feedback.id', 'id');
    expect(contentQb.innerJoin).toHaveBeenCalledWith('feedback.toUser', 'user');
    expect(contentQb.addSelect).toHaveBeenCalledWith('user.githubId', 'githubId');
    expect(contentQb.addSelect).toHaveBeenCalledWith('user.firstName', 'firstName');
    expect(contentQb.addSelect).toHaveBeenCalledWith('user.lastName', 'lastName');
    expect(contentQb.addSelect).toHaveBeenCalledWith('user.countryName', 'countryName');
    expect(contentQb.addSelect).toHaveBeenCalledWith('user.cityName', 'cityName');
    expect(contentQb.addSelect).toHaveBeenCalledWith('user.activist', 'activist');
    expect(contentQb.addSelect).toHaveBeenCalledWith('user.id', 'user_id');
    expect(contentQb.innerJoin).toHaveBeenCalledWith('feedback.fromUser', 'fromUser');
    expect(contentQb.addSelect).toHaveBeenCalledWith(
      'json_build_object(\'githubId\', "fromUser"."githubId", \'firstName\', "fromUser"."firstName", \'lastName\', "fromUser"."lastName")',
      'from',
    );
    expect(contentQb.orderBy).toHaveBeenCalledWith('"feedback"."updatedDate"', 'DESC');
    expect(contentQb.limit).toHaveBeenCalledWith(20);
    expect(contentQb.offset).toHaveBeenCalledWith(0);
    // identical to the legacy response data; count is a number instead of legacy raw string
    expect(result).toEqual({ content: mockRawRows, count: 1 });
  });

  it('applies provided paging and adds courseId column when filtering by course', async () => {
    const countQb = createCountQbMock('5');
    const contentQb = createContentQbMock(mockRawRows);
    mockDataSourceCreateQueryBuilder.mockReturnValue(countQb);
    mockRepoCreateQueryBuilder.mockReturnValue(contentQb);

    await service.getGratitudes({ courseId: 7, pageSize: 10, current: 3 });

    expect(contentQb.addSelect).toHaveBeenCalledWith('"feedback"."courseId"', 'courseId');
    expect(contentQb.andWhere).toHaveBeenCalledWith('"feedback"."courseId" = :courseId', { courseId: 7 });
    expect(contentQb.limit).toHaveBeenCalledWith(10);
    expect(contentQb.offset).toHaveBeenCalledWith(20);
  });
});
