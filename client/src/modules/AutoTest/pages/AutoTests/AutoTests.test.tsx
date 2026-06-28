import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { CheckerEnum } from '@client/api';
import { CourseTaskState, CourseTaskStatus, CourseTaskVerifications } from '@client/modules/AutoTest/types';
import AutoTests from './AutoTests';

// PageLayout drags in the header/session/theme tree; passthrough exposing children.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayout: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ course: { id: 42, alias: 'rs-2025' } }),
}));

const { useCourseTaskVerifications } = vi.hoisted(() => ({
  useCourseTaskVerifications: vi.fn(),
}));
vi.mock('@client/modules/AutoTest/hooks', () => ({
  useCourseTaskVerifications,
  // TaskCard consumes useAttemptsMessage; the real one touches dayjs/verifications,
  // here we only need a stable shape for the card to render.
  useAttemptsMessage: () => ({
    attemptsCount: 2,
    explanation: 'Explanation',
    attemptsLeftMessage: undefined,
    allowStartTask: true,
    allowCheckAnswers: false,
  }),
}));

function task(id: number, name: string, status: CourseTaskStatus): CourseTaskVerifications {
  return {
    id,
    name,
    status,
    state: CourseTaskState.Uncompleted,
    studentStartDate: '2022-09-10T12:00:00.000Z',
    studentEndDate: '2022-10-10T12:00:00.000Z',
    checker: CheckerEnum.AutoTest,
    descriptionUrl: 'description-url',
    publicAttributes: { maxAttemptsNumber: 2 },
  } as CourseTaskVerifications;
}

describe('AutoTests page', () => {
  beforeEach(() => {
    useCourseTaskVerifications.mockReturnValue({
      tasks: [
        task(1, 'Available Task', CourseTaskStatus.Available),
        task(2, 'Missed Task', CourseTaskStatus.Missed),
        task(3, 'Completed Task', CourseTaskStatus.Done),
      ],
    });
  });

  it('should render the page title', () => {
    render(<AutoTests />);

    expect(screen.getByRole('heading', { name: 'Auto-tests' })).toBeInTheDocument();
  });

  it('should render the status tabs', () => {
    render(<AutoTests />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('should show only the tasks of the active (Available) tab by default', () => {
    render(<AutoTests />);

    expect(screen.getByText('Available Task')).toBeInTheDocument();
    expect(screen.queryByText('Missed Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
  });

  it('should switch the visible tasks when another tab is selected', async () => {
    const user = userEvent.setup();
    render(<AutoTests />);

    const missedTab = screen.getByRole('tab', { name: /missed/i });
    await user.click(missedTab);

    expect(screen.getByText('Missed Task')).toBeInTheDocument();
    expect(screen.queryByText('Available Task')).not.toBeInTheDocument();
  });

  it('should render no task cards when there are no tasks', () => {
    useCourseTaskVerifications.mockReturnValue({ tasks: [] });
    render(<AutoTests />);

    expect(screen.queryByRole('link', { name: /preview/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('should count statuses in the tab badges', () => {
    render(<AutoTests />);

    const availableTab = screen.getByRole('tab', { name: /available/i });
    expect(within(availableTab).getByText('1')).toBeInTheDocument();
  });

  it('should fall back to empty lists when the hook returns no tasks (undefined)', () => {
    // exercises the `|| []` fallbacks on `tasks?.map` / `tasks?.filter`
    useCourseTaskVerifications.mockReturnValue({ tasks: undefined });
    render(<AutoTests />);

    expect(screen.getByRole('heading', { name: 'Auto-tests' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.queryByText('Available Task')).not.toBeInTheDocument();
  });
});
