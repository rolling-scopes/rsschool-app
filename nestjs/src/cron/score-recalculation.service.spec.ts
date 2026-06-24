import { describe, expect, it, vi } from 'vitest';
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
  const courseRepository = { find: vi.fn() };
  const service = new ScoreRecalculationService(
    courseRepository as never,
    studentRepository as never,
    courseTaskRepository as never,
  );
  return { service, save };
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
});
