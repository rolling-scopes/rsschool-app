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
  it('renders nothing visible when isVisible is false', () => {
    render(
      <TasksStatsModal
        courseName="Course X"
        tableName="completed tasks"
        tasks={[makeTask()]}
        isVisible={false}
        onHide={vi.fn()}
      />,
    );

    expect(screen.queryByText('Course X statistics')).not.toBeInTheDocument();
  });

  it('renders the modal title, uppercased table name, and task rows with all column renderers', () => {
    render(
      <TasksStatsModal
        courseName="Course X"
        tableName="completed tasks"
        tasks={[makeTask()]}
        isVisible
        onHide={vi.fn()}
      />,
    );

    expect(screen.getByText('Course X statistics')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED TASKS')).toBeInTheDocument();

    // Task name rendered as a link to the descriptionUrl.
    const taskLink = screen.getByRole('link', { name: 'Task One' });
    expect(taskLink).toHaveAttribute('href', 'https://example.com/task1');

    // Score / max.
    expect(screen.getByText('50')).toBeInTheDocument();
    // Weight: score * scoreWeight = 25.00 (text is split across nested <Text> nodes).
    expect(screen.getByText('25.00')).toBeInTheDocument();
    // Comment column.
    expect(screen.getByText('good job')).toBeInTheDocument();
    // GitHub PR link.
    expect(screen.getByRole('link', { name: 'PR' })).toHaveAttribute('href', 'https://github.com/pr/1');
  });

  it('renders fallbacks when score, descriptionUrl and PR uri are missing', () => {
    render(
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
        onHide={vi.fn()}
      />,
    );

    // Task name without link.
    expect(screen.queryByRole('link', { name: 'Plain Task' })).not.toBeInTheDocument();
    expect(screen.getByText('Plain Task')).toBeInTheDocument();
    // No PR link.
    expect(screen.queryByRole('link', { name: 'PR' })).not.toBeInTheDocument();
  });

  it('calls onHide when the modal is cancelled', async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();
    render(
      <TasksStatsModal
        courseName="Course X"
        tableName="completed tasks"
        tasks={[makeTask()]}
        isVisible
        onHide={onHide}
      />,
    );

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onHide).toHaveBeenCalled();
  });
});
