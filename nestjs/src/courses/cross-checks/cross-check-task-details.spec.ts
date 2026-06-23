import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';

const criteria = [
  { key: 'c1', max: 10, text: 'Code quality', type: 'subtask' },
  { key: 'c2', text: 'Penalty for cheating', type: 'penalty', max: 50 },
];
const studentEndDate = '2024-03-08T23:59:00.000Z';

function createFakeQueryBuilder(result: unknown) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of ['innerJoinAndSelect', 'where']) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getOne = vi.fn(async () => result);
  return { qb, calls };
}

describe('CourseCrossCheckService.getTaskDetails', () => {
  function setup(result: unknown) {
    const { qb, calls } = createFakeQueryBuilder(result);
    const service = new CourseCrossCheckService(
      {} as never,
      {} as never,
      {} as never,
      { createQueryBuilder: vi.fn(() => qb) } as never,
    );
    return { service, calls };
  }

  it('builds the same query as the legacy getCourseTask', async () => {
    const { service, calls } = setup(null);

    await service.getTaskDetails(15);

    expect(calls.innerJoinAndSelect).toEqual([['courseTask.task', 'task']]);
    expect(calls.where).toEqual([['courseTask.id = :courseTaskId', { courseTaskId: 15 }]]);
  });

  it('returns criteria and studentEndDate of the course task', async () => {
    const { service } = setup({ id: 15, studentEndDate, task: { attributes: { criteria } } });

    const result = await service.getTaskDetails(15);

    expect(result).toEqual({ criteria, studentEndDate });
  });

  it('returns empty criteria when task has no criteria attribute', async () => {
    const { service } = setup({ id: 15, studentEndDate, task: { attributes: {} } });

    const result = await service.getTaskDetails(15);

    expect(result).toEqual({ criteria: [], studentEndDate });
  });

  it('returns empty details when the course task is not found', async () => {
    const { service } = setup(null);

    const result = await service.getTaskDetails(15);

    expect(result).toEqual({ criteria: [], studentEndDate: undefined });
  });
});

describe('CourseCrossCheckController.getTaskDetails', () => {
  const mockGetTaskDetails = vi.fn();
  let controller: CourseCrossCheckController;

  beforeEach(async () => {
    mockGetTaskDetails.mockReset().mockResolvedValue({ criteria, studentEndDate });

    const module = await Test.createTestingModule({
      controllers: [CourseCrossCheckController],
      providers: [
        { provide: CourseCrossCheckService, useValue: { getTaskDetails: mockGetTaskDetails } },
        { provide: CourseTasksService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CourseCrossCheckController);
  });

  it('responds with criteria and studentEndDate from the service', async () => {
    const result = await controller.getTaskDetails(11, 15);

    expect(mockGetTaskDetails).toHaveBeenCalledWith(15);
    expect({ ...result }).toEqual({ criteria, studentEndDate });
  });

  it('passes through empty details', async () => {
    mockGetTaskDetails.mockResolvedValue({ criteria: [], studentEndDate: undefined });

    const result = await controller.getTaskDetails(11, 15);

    expect({ ...result }).toEqual({ criteria: [], studentEndDate: undefined });
  });
});
