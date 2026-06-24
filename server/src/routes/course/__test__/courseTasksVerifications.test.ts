import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { getRepository } from 'typeorm';
import { getCourseTasksVerifications } from '../taskVerifications';

vi.mock('typeorm', async importOriginal => {
  const actual = await importOriginal<typeof import('typeorm')>();
  return { ...actual, getRepository: vi.fn(), getCustomRepository: vi.fn() };
});

const rawVerifications = [
  {
    id: 1,
    status: 'pending',
    courseTaskId: 15,
    student: { id: 31, user: { githubId: 'john-doe' } },
    courseTask: {
      id: 15,
      task: {
        name: 'JS Task',
        githubRepoName: 'rsschool/js',
        sourceGithubRepoUrl: 'https://github.com/rsschool/js',
        attributes: { foo: 'bar' },
      },
    },
  },
];

function createFakeQueryBuilder(content: unknown[]) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of ['select', 'innerJoin', 'addSelect', 'where', 'andWhere', 'orderBy']) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getMany = vi.fn(async () => content);
  return { qb, calls };
}

const createCtx = () => ({
  params: { courseId: '11' },
  status: 0,
  body: undefined as unknown,
  res: { setHeader: vi.fn() },
});

const logger = {} as never;

describe('getCourseTasksVerifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns pending verifications mapped to the AWS payload shape', async () => {
    const { qb, calls } = createFakeQueryBuilder(rawVerifications);
    (getRepository as Mock).mockReturnValue({ createQueryBuilder: vi.fn(() => qb) });
    const ctx = createCtx();

    await getCourseTasksVerifications(logger)(ctx as never);

    expect(calls.where).toEqual([['courseTask.courseId = :courseId', { courseId: '11' }]]);
    expect(calls.andWhere).toEqual([
      ['courseTask.disabled = :disabled', { disabled: false }],
      ["v.status = 'pending' "],
    ]);
    expect(calls.orderBy).toEqual([['v.createdDate', 'ASC']]);
    expect(ctx.status).toBe(200);
    expect(ctx.body).toEqual({
      data: [
        {
          courseId: 11,
          id: 1,
          githubId: 'john-doe',
          courseTaskId: 15,
          taskName: 'JS Task',
          sourceGithubRepoUrl: 'https://github.com/rsschool/js',
          githubRepoName: 'rsschool/js',
          attributes: { foo: 'bar' },
        },
      ],
    });
  });

  it('returns an empty list when there are no pending verifications', async () => {
    const { qb } = createFakeQueryBuilder([]);
    (getRepository as Mock).mockReturnValue({ createQueryBuilder: vi.fn(() => qb) });
    const ctx = createCtx();

    await getCourseTasksVerifications(logger)(ctx as never);

    expect(ctx.body).toEqual({ data: [] });
  });
});
