import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { WriteScoreService } from './write-score.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ConfigService } from 'src/config';

const exportRows = [
  { githubId: 'john-doe', name: 'John Doe', contacts: { email: 'john@example.com' }, 'Task A': 10 },
  { githubId: 'jane-roe', name: 'Jane', contacts: { email: 'jane@example.com' }, 'Task A': 0 },
];

const expectedCsv = [
  '"githubId","name","contacts.email","Task A"',
  '"john-doe","John Doe","john@example.com",10',
  '"jane-roe","Jane","jane@example.com",0',
].join('\n');

const mockGetStudentsScoreForExport = vi.fn();
const mockGetScore = vi.fn();
const mockGetStudentScore = vi.fn();

const createReq = (user: Record<string, unknown>) => ({ user }) as never;
const createRes = () => ({ setHeader: vi.fn(), end: vi.fn() });

describe('ScoreController.getScoreCsv', () => {
  let controller: ScoreController;

  beforeEach(async () => {
    mockGetStudentsScoreForExport.mockReset().mockResolvedValue(exportRows);

    const module = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [
        { provide: ScoreService, useValue: { getStudentsScoreForExport: mockGetStudentsScoreForExport } },
        { provide: WriteScoreService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get(ScoreController);
  });

  it('responds with flattened csv content and csv headers', async () => {
    const res = createRes();

    await controller.getScoreCsv(createReq({ isAdmin: false, isHirer: false, courses: {} }), res as never, 11);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(res.setHeader).toHaveBeenCalledWith('Content-disposition', 'filename="score.csv"');
    expect(res.end).toHaveBeenCalledWith(expectedCsv);
  });

  it('passes courseId and filters (activeOnly=false, cityName, mentor.githubId) to the service', async () => {
    await controller.getScoreCsv(
      createReq({ isAdmin: false, isHirer: false, courses: {} }),
      createRes() as never,
      11,
      'Minsk',
      'mentor-mike',
    );

    expect(mockGetStudentsScoreForExport).toHaveBeenCalledWith(
      11,
      { activeOnly: false, cityName: 'Minsk', 'mentor.githubId': 'mentor-mike' },
      expect.anything(),
    );
  });

  it.each([
    ['plain supervisor', { isAdmin: false, isHirer: false, courses: { 11: { roles: ['supervisor'] } } }, false, false],
    ['admin', { isAdmin: true, isHirer: false, courses: {} }, true, true],
    ['hirer', { isAdmin: false, isHirer: true, courses: {} }, true, true],
    ['course manager', { isAdmin: false, isHirer: false, courses: { 11: { roles: ['manager'] } } }, false, true],
  ])('derives export options for %s', async (_, user, includeContacts, includeCertificate) => {
    await controller.getScoreCsv(createReq(user), createRes() as never, 11);

    expect(mockGetStudentsScoreForExport).toHaveBeenCalledWith(11, expect.anything(), {
      includeContacts,
      includeCertificate,
    });
  });

  it('treats a missing course entry as not-a-manager (no certificate access)', async () => {
    // courses has no entry for courseId 11 -> isCourseManager is undefined -> ?? false branch
    await controller.getScoreCsv(createReq({ isAdmin: false, isHirer: false, courses: {} }), createRes() as never, 11);

    expect(mockGetStudentsScoreForExport).toHaveBeenCalledWith(11, expect.anything(), {
      includeContacts: false,
      includeCertificate: false,
    });
  });

  it('defaults include flags to false when isAdmin/isHirer are undefined', async () => {
    // isAdmin and isHirer absent -> (undefined || undefined) -> undefined -> ?? false fallback
    await controller.getScoreCsv(createReq({ courses: {} }), createRes() as never, 11);

    expect(mockGetStudentsScoreForExport).toHaveBeenCalledWith(11, expect.anything(), {
      includeContacts: false,
      includeCertificate: false,
    });
  });
});

describe('ScoreController.getScore', () => {
  let controller: ScoreController;

  beforeEach(async () => {
    mockGetScore.mockReset().mockResolvedValue({ content: [], pagination: {} });

    const module = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [
        { provide: ScoreService, useValue: { getScore: mockGetScore } },
        { provide: WriteScoreService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get(ScoreController);
  });

  it('passes explicit ordering, paging and filter through to the service and returns its result', async () => {
    const query = {
      orderBy: 'rank',
      orderDirection: 'asc',
      current: '2',
      pageSize: '50',
      activeOnly: 'true',
    } as never;

    const result = await controller.getScore(query, 11);

    expect(mockGetScore).toHaveBeenCalledWith({
      courseId: 11,
      filter: query,
      orderBy: { field: 'rank', direction: 'ASC' },
      page: 2,
      limit: 50,
    });
    expect(result).toStrictEqual({ content: [], pagination: {} });
  });

  it('defaults ordering to totalScore/DESC when orderBy and orderDirection are absent', async () => {
    const query = { current: '1', pageSize: '20', activeOnly: 'false' } as never;

    await controller.getScore(query, 11);

    expect(mockGetScore).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { field: 'totalScore', direction: 'DESC' },
        page: 1,
        limit: 20,
      }),
    );
  });
});

describe('ScoreController.getStudentScore', () => {
  let controller: ScoreController;

  beforeEach(async () => {
    mockGetStudentScore.mockReset().mockResolvedValue({ totalScore: 42 });

    const module = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [
        { provide: ScoreService, useValue: { getStudentScore: mockGetStudentScore } },
        { provide: WriteScoreService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get(ScoreController);
  });

  it('delegates to the service with githubId/courseId and returns the student score', async () => {
    const result = await controller.getStudentScore(11, 'john-doe');

    expect(mockGetStudentScore).toHaveBeenCalledWith({ githubId: 'john-doe', courseId: 11 });
    expect(result).toStrictEqual({ totalScore: 42 });
  });
});
