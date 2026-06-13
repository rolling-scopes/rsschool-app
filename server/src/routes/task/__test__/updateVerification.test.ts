import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { getRepository } from 'typeorm';
import { taskRoute } from '../index';

const { mockSaveScore, scoreConstructorCalls } = vi.hoisted(() => ({
  mockSaveScore: vi.fn(),
  scoreConstructorCalls: [] as unknown[][],
}));

vi.mock('typeorm', async importOriginal => {
  const actual = await importOriginal<typeof import('typeorm')>();
  return { ...actual, getRepository: vi.fn(), getCustomRepository: vi.fn() };
});

vi.mock('../../guards', () => ({ adminGuard: vi.fn(), basicAuthAws: vi.fn() }));

vi.mock('../../../services/score', () => ({
  ScoreService: class {
    constructor(...args: unknown[]) {
      scoreConstructorCalls.push(args);
    }
    saveScore = mockSaveScore;
  },
}));

function getPutHandler() {
  const router = taskRoute({ error: vi.fn() } as never);
  const layer = (router as any).stack.find(
    (l: any) => l.path === '/task/verification/:id' && l.methods.includes('PUT'),
  );
  return layer.stack[layer.stack.length - 1];
}

const savedResult = {
  id: 71,
  studentId: 31,
  courseTaskId: 15,
  details: 'looks good',
  score: 42,
  status: 'completed',
};

describe('PUT /task/verification/:id', () => {
  beforeEach(() => {
    scoreConstructorCalls.length = 0;
    mockSaveScore.mockReset();
  });

  it('persists the verification (without createdDate), saves the score and returns the record', async () => {
    const saveMock = vi.fn();
    const findOneByMock = vi.fn().mockResolvedValue(savedResult);
    (getRepository as Mock).mockReturnValue({ save: saveMock, findOneBy: findOneByMock });

    const ctx = {
      params: { id: 71 },
      request: { body: { createdDate: '2024-01-01', score: 42.4, details: 'looks good', status: 'completed' } },
      status: 0,
      body: undefined as unknown,
      res: { setHeader: vi.fn() },
    };

    await getPutHandler()(ctx);

    expect(saveMock).toHaveBeenCalledWith({ score: 42, details: 'looks good', status: 'completed', id: 71 });
    expect(scoreConstructorCalls[0]).toEqual([0]);
    expect(mockSaveScore).toHaveBeenCalledWith(31, 15, { comment: 'looks good', score: 42 });
    expect(ctx.status).toBe(200);
    expect(ctx.body).toEqual({ data: savedResult });
  });

  it('responds 400 when persistence throws', async () => {
    (getRepository as Mock).mockReturnValue({
      save: vi.fn().mockRejectedValue(new Error('db boom')),
      findOneBy: vi.fn(),
    });

    const ctx = {
      params: { id: 71 },
      request: { body: { score: 1, details: 'x', status: 'completed' } },
      status: 0,
      body: undefined as unknown,
      res: { setHeader: vi.fn() },
    };

    await getPutHandler()(ctx);

    expect(ctx.status).toBe(400);
    expect(ctx.body).toEqual({ data: { message: 'db boom' } });
  });
});
