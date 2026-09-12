import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TasksStatsModal } from './TasksStatsModal';
import type { TaskStat } from './TasksStatsCard';

function makeTask(overrides: Partial<TaskStat> = {}): TaskStat {
  return {
    id: 1,
    name: 'Task One',
    score: 50,
    maxScore: 100,
    scoreWeight: 0.5,
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-02-01T12:00:00.000Z',
    comment: 'good job',
    descriptionUrl: 'https://example.com/task1',
    githubPrUri: 'https://github.com/pr/1',
    ...overrides,
  } as TaskStat;
}

describe('<TasksStatsModal />', () => {
  it('renders hidden, populated, fallback, and cancel states', async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();
    const { rerender } = render(
      <TasksStatsModal
        courseName="Course X"
        tableName="completed tasks"
        tasks={[makeTask()]}
        isVisible={false}
        onHide={onHide}
      />,
    );

    expect(screen.queryByText('Course X statistics')).not.toBeInTheDocument();

    rerender(
      <TasksStatsModal
        courseName="Course X"
        tableName="completed tasks"
        tasks={[makeTask()]}
        isVisible
        onHide={onHide}
      />,
    );

    expect(screen.getByText('Course X statistics')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED TASKS')).toBeInTheDocument();

    const taskLink = screen.getByRole('link', { name: 'Task One' });
    expect(taskLink).toHaveAttribute('href', 'https://example.com/task1');

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('25.00')).toBeInTheDocument();
    expect(screen.getByText('good job')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PR' })).toHaveAttribute('href', 'https://github.com/pr/1');

    rerender(
      <TasksStatsModal
        courseName="Course X"
        tableName="missed tasks"
        tasks={[
          makeTask({
            id: 2,
            name: 'Plain Task',
            score: undefined,
            maxScore: undefined,
            descriptionUrl: undefined,
            githubPrUri: undefined,
            comment: undefined,
          }),
        ]}
        isVisible
        onHide={onHide}
      />,
    );

    expect(screen.queryByRole('link', { name: 'Plain Task' })).not.toBeInTheDocument();
    expect(screen.getByText('Plain Task')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'PR' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onHide).toHaveBeenCalled();
  });
});
