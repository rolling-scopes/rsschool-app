import { describe, it, expect } from 'vitest';
import { TaskDtoTypeEnum } from '@client/api';
import { TASK_TYPES } from '@client/data/taskTypes';
import { generateTasksData, COURSE_NAME_MOCK } from './test-utils';

describe('generateTasksData (test fixture helper)', () => {
  it('generates the requested number of tasks with sequential ids', () => {
    const tasks = generateTasksData(3);
    expect(tasks).toHaveLength(3);
    expect(tasks.map(t => t.id)).toEqual([0, 1, 2]);
    // The first task carries the active course; the rest have no courses.
    expect(tasks[0].courses).toEqual([{ name: COURSE_NAME_MOCK, isActive: true }]);
    expect(tasks[1].courses).toEqual([]);
  });

  it('falls back to the JS task type once the task-type catalogue is exhausted', () => {
    // Asking for more tasks than TASK_TYPES has entries exercises `TASK_TYPES[i]?.id ?? Jstask`.
    const tasks = generateTasksData(TASK_TYPES.length + 1);
    const last = tasks[tasks.length - 1];
    expect(last.type).toBe(TaskDtoTypeEnum.Jstask);
  });
});
