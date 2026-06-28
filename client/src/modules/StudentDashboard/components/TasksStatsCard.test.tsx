import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/router';
import { CourseScheduleItemDtoStatusEnum } from '@client/api';
import { TasksStatsCard } from './TasksStatsCard';
import type { TaskStat } from './TasksStatsCard';

// Replace the dynamically-imported chart (ssr:false, @ant-design/plots) with a lightweight
// stub that exposes the onItemSelected callback as a clickable button per data item.
vi.mock('./TasksChart', () => ({
  default: ({
    data,
    onItemSelected,
  }: {
    data: { status: string; value: number }[];
    onItemSelected: (i: { status: string; value: number }) => void;
  }) => (
    <div data-testid="tasks-chart">
      {data.map(d => (
        <button key={d.status} onClick={() => onItemSelected(d)}>
          chart-{d.status}-{d.value}
        </button>
      ))}
    </div>
  ),
}));

// `dynamic()` from next/dynamic should resolve to the stubbed default synchronously.
vi.mock('next/dynamic', () => ({
  default: (importer: () => Promise<{ default: unknown }>) => {
    // Eagerly resolve the (mocked) module's default export.
    let Comp: unknown = () => null;
    importer().then(m => {
      Comp = m.default;
    });
    return (props: Record<string, unknown>) => {
      const Resolved = Comp as React.FC<Record<string, unknown>>;
      return <Resolved {...props} />;
    };
  },
}));

const replace = vi.fn();

function makeTask(status: CourseScheduleItemDtoStatusEnum, overrides: Partial<TaskStat> = {}): TaskStat {
  return {
    id: Math.random(),
    name: `Task ${status}`,
    status,
    score: 10,
    maxScore: 100,
    scoreWeight: 0.5,
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-02-01T00:00:00.000Z',
    ...overrides,
  } as TaskStat;
}

function makeTasksByStatus() {
  return {
    [CourseScheduleItemDtoStatusEnum.Done]: [makeTask(CourseScheduleItemDtoStatusEnum.Done)],
    [CourseScheduleItemDtoStatusEnum.Available]: [makeTask(CourseScheduleItemDtoStatusEnum.Available)],
  } as Record<CourseScheduleItemDtoStatusEnum, TaskStat[]>;
}

describe('<TasksStatsCard />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      query: {},
      route: '/course/student/dashboard',
      replace,
    });
  });

  it('renders the "Tasks Statistics" card with a chart entry per status', async () => {
    render(<TasksStatsCard tasksByStatus={makeTasksByStatus()} courseName="Course Y" />);

    expect(screen.getByText('Tasks Statistics')).toBeInTheDocument();
    expect(await screen.findByTestId('tasks-chart')).toBeInTheDocument();
    expect(screen.getByText(/chart-done-1/)).toBeInTheDocument();
    expect(screen.getByText(/chart-available-1/)).toBeInTheDocument();
  });

  it('updates the URL with the chosen status when a chart segment is clicked', async () => {
    const user = userEvent.setup();
    render(<TasksStatsCard tasksByStatus={makeTasksByStatus()} courseName="Course Y" />);

    await user.click(await screen.findByText(/chart-done-1/));

    expect(replace).toHaveBeenCalledWith(expect.stringContaining('statType=done'));
  });

  it('opens the stats modal when the router query has a valid statType', async () => {
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      query: { statType: CourseScheduleItemDtoStatusEnum.Done },
      route: '/course/student/dashboard',
      replace,
    });

    render(<TasksStatsCard tasksByStatus={makeTasksByStatus()} courseName="Course Y" />);

    expect(await screen.findByText('Course Y statistics')).toBeInTheDocument();
    expect(screen.getByText(/DONE TASKS/i)).toBeInTheDocument();
  });

  it('ignores an unknown statType in the query (no modal opens)', async () => {
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      query: { statType: 'not-a-real-status' },
      route: '/course/student/dashboard',
      replace,
    });

    render(<TasksStatsCard tasksByStatus={makeTasksByStatus()} courseName="Course Y" />);

    expect(await screen.findByTestId('tasks-chart')).toBeInTheDocument();
    expect(screen.queryByText('Course Y statistics')).not.toBeInTheDocument();
  });

  it('closes the modal and clears statType from the URL when dismissed', async () => {
    const user = userEvent.setup();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      query: { statType: CourseScheduleItemDtoStatusEnum.Done },
      route: '/course/student/dashboard',
      replace,
    });

    render(<TasksStatsCard tasksByStatus={makeTasksByStatus()} courseName="Course Y" />);
    expect(await screen.findByText('Course Y statistics')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      // updateUrl() with no statType -> replace called with a URL without statType.
      const lastCall = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).not.toContain('statType');
    });
  });
});
