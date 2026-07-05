import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScoreRecalculationService } from './score-recalculation.service';

// Minimal createQueryBuilder mock whose getMany resolves the given rows.
function queryBuilderReturning(rows: unknown[]) {
  const qb: Record<string, unknown> = {};
  for (const m of ['leftJoin', 'innerJoinAndSelect', 'addSelect', 'where', 'andWhere']) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getMany = vi.fn(async () => rows);
  return qb;
}

const courseTasks = [
  { id: 1, scoreWeight: 1, checker: 'auto' },
  { id: 2, scoreWeight: 2, checker: 'crossCheck' },
];

// student rows as returned by the studentRepository query (entity shape used by getStudentsTaskScores)
const students = [
  {
    id: 101,
    rank: 0,
    totalScore: 0,
    crossCheckScore: 0,
    totalScoreChangeDate: null,
    taskResults: [{ courseTaskId: 1, score: 10, courseTask: { disabled: false } }],
    taskInterviewResults: [],
    stageInterviews: [],
  },
  {
    id: 102,
    rank: 0,
    totalScore: 0,
    crossCheckScore: 0,
    totalScoreChangeDate: null,
    // cross-check task (weight 2) -> contributes to both total and crossCheck score
    taskResults: [{ courseTaskId: 2, score: 5, courseTask: { disabled: false } }],
    taskInterviewResults: [],
    stageInterviews: [],
  },
  {
    id: 103,
    rank: 0,
    totalScore: 0,
    crossCheckScore: 0,
    totalScoreChangeDate: null,
    // disabled task result must be excluded; interview result must be included (weight default 1)
    taskResults: [{ courseTaskId: 1, score: 99, courseTask: { disabled: true } }],
    taskInterviewResults: [{ courseTaskId: 7, score: 3, updatedDate: '2024-01-01' }],
    stageInterviews: [],
  },
];

function buildService(studentRows: unknown[]) {
  const save = vi.fn();
  const studentRepository = {
    createQueryBuilder: vi.fn(() => queryBuilderReturning(studentRows)),
    save,
  };
  const courseTaskRepository = { createQueryBuilder: vi.fn(() => queryBuilderReturning(courseTasks)) };
  const find = vi.fn();
  const courseRepository = { find };
  const service = new ScoreRecalculationService(
    courseRepository as never,
    studentRepository as never,
    courseTaskRepository as never,
  );
  return { service, save, find };
}

describe('ScoreRecalculationService.recalculateTotalScore', () => {
  it('computes weighted totalScore + crossCheckScore, excludes disabled, includes interviews, ranks with ties', async () => {
    const { service, save } = buildService(students);

    await service.recalculateTotalScore([{ id: 1, name: 'c' } as never]);

    expect(save).toHaveBeenCalledTimes(1);
    const saved = save.mock.calls[0][0] as Array<{
      id: number;
      totalScore: number;
      crossCheckScore: number;
      rank: number;
    }>;
    const byId = Object.fromEntries(saved.map(s => [s.id, s]));

    // 101: 10*1 = 10 total, 0 crossCheck
    expect(byId[101]).toMatchObject({ totalScore: 10, crossCheckScore: 0 });
    // 102: 5*2 = 10 total, 10 crossCheck
    expect(byId[102]).toMatchObject({ totalScore: 10, crossCheckScore: 10 });
    // 103: disabled task excluded, interview 3*1 = 3 total
    expect(byId[103]).toMatchObject({ totalScore: 3, crossCheckScore: 0 });

    // ranks: 10,10,3 -> 101 & 102 tie at rank 1, 103 at rank 3
    expect(byId[101].rank).toBe(1);
    expect(byId[102].rank).toBe(1);
    expect(byId[103].rank).toBe(3);
  });

  it('saves only changed students (skips those whose score and rank are already correct)', async () => {
    // single student already at the correct totalScore/crossCheckScore/rank -> nothing to update
    const settled = [
      {
        id: 200,
        rank: 1,
        totalScore: 10,
        crossCheckScore: 0,
        totalScoreChangeDate: new Date('2024-01-01'),
        taskResults: [{ courseTaskId: 1, score: 10, courseTask: { disabled: false } }],
        taskInterviewResults: [],
        stageInterviews: [],
      },
    ];
    const { service, save } = buildService(settled);

    await service.recalculateTotalScore([{ id: 1, name: 'c' } as never]);

    expect(save).not.toHaveBeenCalled(); // no changed students -> nothing persisted
  });

  it('loads non-completed courses from the repository when no courses argument is given', async () => {
    const { service, find } = buildService([]);
    find.mockResolvedValue([]); // no courses -> loop body skipped

    await service.recalculateTotalScore();

    expect(find).toHaveBeenCalledWith({ where: { completed: false } });
  });

  it('includes the stage pre-screening score as a task result for the interview course task', async () => {
    const withStageInterview = [
      {
        id: 300,
        rank: 0,
        totalScore: 0,
        crossCheckScore: 0,
        totalScoreChangeDate: null,
        taskResults: [],
        taskInterviewResults: [],
        stageInterviews: [
          {
            courseTaskId: 1,
            isCompleted: true,
            score: 7,
            stageInterviewFeedbacks: [{ updatedDate: '2024-01-01', json: '{}' }],
          },
        ],
      },
    ];
    const { service, save } = buildService(withStageInterview);

    await service.recalculateTotalScore([{ id: 1, name: 'c' } as never]);

    const saved = save.mock.calls[0][0] as Array<{ id: number; totalScore: number }>;
    // pre-screening score 7 floored, weight of courseTask 1 = 1 -> total 7
    expect(saved.find(s => s.id === 300)).toMatchObject({ totalScore: 7 });
  });

  it('does not duplicate the pre-screening score when the interview task already has a task result', async () => {
    const dedup = [
      {
        id: 301,
        rank: 0,
        totalScore: 0,
        crossCheckScore: 0,
        totalScoreChangeDate: null,
        // existing task result for courseTaskId 1 (weight 1, score 4)
        taskResults: [{ courseTaskId: 1, score: 4, courseTask: { disabled: false } }],
        taskInterviewResults: [],
        stageInterviews: [
          {
            courseTaskId: 1,
            isCompleted: true,
            score: 7,
            stageInterviewFeedbacks: [{ updatedDate: '2024-01-01', json: '{}' }],
          },
        ],
      },
    ];
    const { service, save } = buildService(dedup);

    await service.recalculateTotalScore([{ id: 1, name: 'c' } as never]);

    const saved = save.mock.calls[0][0] as Array<{ id: number; totalScore: number }>;
    // pre-screening (7) is filtered out because courseTaskId 1 already exists -> only existing 4 counts
    expect(saved.find(s => s.id === 301)).toMatchObject({ totalScore: 4 });
  });

  it('falls back to empty results and zero pre-screening when student collections are nullish', async () => {
    const nullish = [
      {
        id: 302,
        rank: 5, // start at a non-1 rank so the recomputed rank 1 marks it changed -> saved
        totalScore: 0,
        crossCheckScore: 0,
        totalScoreChangeDate: null,
        // taskResults, taskInterviewResults & stageInterviews intentionally undefined
        // -> exercises the ?? [] fallbacks, the stageInterviews?.length falsy arm
        // and exportStageInterviewRating([]) -> null -> ?? 0 fallback
      },
    ];
    const { service, save } = buildService(nullish);

    await service.recalculateTotalScore([{ id: 1, name: 'c' } as never]);

    const saved = save.mock.calls[0][0] as Array<{ id: number; totalScore: number; rank: number }>;
    expect(saved.find(s => s.id === 302)).toMatchObject({ totalScore: 0, rank: 1 });
  });

  it('persists in chunks of 500 and sleeps between chunks for large cohorts', async () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    // 501 students all with distinct scores so every one is "changed" and gets saved
    const many = Array.from({ length: 501 }, (_, i) => ({
      id: 1000 + i,
      rank: 0,
      totalScore: 0,
      crossCheckScore: 0,
      totalScoreChangeDate: null,
      taskResults: [{ courseTaskId: 1, score: i + 1, courseTask: { disabled: false } }],
      taskInterviewResults: [],
      stageInterviews: [],
    }));
    const { service, save } = buildService(many);

    const promise = service.recalculateTotalScore([{ id: 1, name: 'c' } as never]);
    // allow the first chunk + the sleep timer to be scheduled, then advance time
    await vi.runAllTimersAsync();
    await promise;

    expect(save).toHaveBeenCalledTimes(2); // 500 + 1
    expect(save.mock.calls[0][0]).toHaveLength(500);
    expect(save.mock.calls[1][0]).toHaveLength(1);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10_000);
  });
});

describe('ScoreRecalculationService.handleCron', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs and recalculates scores for the non-completed courses', async () => {
    const { service, find } = buildService([]);
    find.mockResolvedValue([]);
    const spy = vi.spyOn(service, 'recalculateTotalScore');

    await service.handleCron();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenCalledWith({ where: { completed: false } });
  });
});
