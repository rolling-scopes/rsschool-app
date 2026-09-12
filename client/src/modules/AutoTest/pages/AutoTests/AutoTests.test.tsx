import { render, screen, within } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
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

const { useCourseTaskVerifications, markTaskAsDone } = vi.hoisted(() => ({
  useCourseTaskVerifications: vi.fn(),
  markTaskAsDone: vi.fn(),
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
    markTaskAsDone.mockClear();
    useCourseTaskVerifications.mockReturnValue({
      tasks: [
        task(1, 'Available Task', CourseTaskStatus.Available),
        task(2, 'Missed Task', CourseTaskStatus.Missed),
        task(3, 'Completed Task', CourseTaskStatus.Done),
      ],
      markTaskAsDone,
    });
  });

  it('should render initial tabs and tasks, then switch the visible tasks', async () => {
    const user = setupUser();
    render(<AutoTests />);

    expect(screen.getByRole('heading', { name: 'Auto-tests' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText('Available Task')).toBeInTheDocument();
    expect(screen.queryByText('Missed Task')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
    const availableTab = screen.getByRole('tab', { name: /available/i });
    expect(within(availableTab).getByText('1')).toBeInTheDocument();

    const missedTab = screen.getByRole('tab', { name: /missed/i });
    await user.click(missedTab);

    expect(screen.getByText('Missed Task')).toBeInTheDocument();
    expect(screen.queryByText('Available Task')).not.toBeInTheDocument();
  });

  it('calls markTaskAsDone with the task id when "Done Task" is clicked on the Available tab', async () => {
    const user = setupUser();
    const passedTask = {
      ...task(1, 'Available Task', CourseTaskStatus.Available),
      verifications: [{ score: 90 }],
      publicAttributes: { maxAttemptsNumber: 2, tresholdPercentage: 80 },
    } as unknown as CourseTaskVerifications;
    useCourseTaskVerifications.mockReturnValue({ tasks: [passedTask], markTaskAsDone });
    render(<AutoTests />);

    await user.click(screen.getByRole('button', { name: /done task/i }));

    expect(markTaskAsDone).toHaveBeenCalledWith(1);
  });

  it('should render no task cards when there are no tasks', () => {
    useCourseTaskVerifications.mockReturnValue({ tasks: [] });
    render(<AutoTests />);

    expect(screen.queryByRole('link', { name: /preview/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
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
