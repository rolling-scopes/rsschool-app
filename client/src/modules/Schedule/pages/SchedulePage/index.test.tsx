import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchedulePage } from './index';
import {
  CourseScheduleItemDtoStatusEnum as StatusEnum,
  CourseScheduleItemDtoTagEnum as TagEnum,
  CourseScheduleItemDtoTypeEnum,
} from '@client/api';

// --- Boundary: generated API clients --------------------------------------
const { getSchedule, getScheduleICalendarToken, createCourseTask, copySchedule } = vi.hoisted(() => ({
  getSchedule: vi.fn(),
  getScheduleICalendarToken: vi.fn(),
  createCourseTask: vi.fn(),
  copySchedule: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesScheduleApi: function CoursesScheduleApi() {
    return { getSchedule, copySchedule };
  },
  CoursesScheduleIcalApi: function CoursesScheduleIcalApi() {
    return { getScheduleICalendarToken };
  },
  CoursesTasksApi: function CoursesTasksApi() {
    return { createCourseTask };
  },
}));

// --- Boundary: course manager check ---------------------------------------
const { isCourseManager } = vi.hoisted(() => ({ isCourseManager: vi.fn() }));
vi.mock('@client/domain/user', async () => ({
  ...(await vi.importActual('@client/domain/user')),
  isCourseManager,
}));

// --- Boundary: Course contexts (Session + active course) ------------------
const { mockCourse, mockSession } = vi.hoisted(() => ({
  mockCourse: { id: 42, alias: 'js-2024', name: 'JS Course' },
  mockSession: { id: 1, githubId: 'tester' },
}));
vi.mock('@client/modules/Course/contexts', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  return {
    SessionContext: React.createContext(mockSession),
    useActiveCourseContext: () => ({ course: mockCourse, courses: [], setCourse: vi.fn(), refresh: vi.fn() }),
  };
});

// --- Boundary: react-use async/data hooks ---------------------------------
// useMedia (mobile breakpoint) and useLocalStorage (status tab) are controllable
// per test via the hoisted refs below; useAsyncRetry drives the schedule fetch.
const reactUseState = vi.hoisted(() => ({ mobile: false, retry: vi.fn() }));
vi.mock('react-use', async () => {
  const actual = await vi.importActual<typeof import('react-use')>('react-use');
  return {
    ...actual,
    useMedia: () => reactUseState.mobile,
    useAsyncRetry: (fn: () => Promise<unknown>) => {
      // Invoke once so the API boundary mocks are exercised, mirroring real behaviour.
      fn();
      return { retry: reactUseState.retry, value: scheduleData, loading: false, error: undefined };
    },
  };
});

// --- Child modals: stub to lightweight harnesses --------------------------
// Each real modal is date-heavy and already covered by its own suite; here we only
// assert SchedulePage's orchestration (open → submit/cancel → API + refresh).
vi.mock('@client/modules/CourseManagement/components/CourseTaskModal', () => ({
  CourseTaskModal: ({ onSubmit, onCancel }: { onSubmit: (r: unknown) => void; onCancel: () => void }) => (
    <div data-testid="course-task-modal">
      <button onClick={() => onSubmit({ name: 'task' })}>submit-task</button>
      <button onClick={onCancel}>cancel-task</button>
    </div>
  ),
}));
vi.mock('@client/modules/CourseManagement/components/CourseEventModal', () => ({
  CourseEventModal: ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div data-testid="course-event-modal">
      <button onClick={onSubmit}>submit-event</button>
      <button onClick={onCancel}>cancel-event</button>
    </div>
  ),
}));
vi.mock('@client/modules/CourseManagement/components/CoursesListModal', () => ({
  CoursesListModal: ({
    data,
    onSubmit,
    onCancel,
  }: {
    data: unknown;
    onSubmit: (r: { id: number }) => void;
    onCancel: () => void;
  }) =>
    data ? (
      <div data-testid="copy-modal">
        <button onClick={() => onSubmit({ id: 7 })}>submit-copy</button>
        <button onClick={onCancel}>cancel-copy</button>
      </div>
    ) : null,
}));

function makeItem(idx: number, status: StatusEnum, tag: TagEnum) {
  return {
    id: idx,
    type: CourseScheduleItemDtoTypeEnum.CourseTask,
    name: `Course Item ${idx}`,
    startDate: '2020-02-01T21:00:00.000Z',
    endDate: '2020-03-15T20:59:00.000Z',
    maxScore: 100,
    scoreWeight: 0.2,
    organizer: { id: idx, name: '', githubId: `organizer-${idx}` },
    status,
    score: 20,
    tag,
    descriptionUrl: '',
    crossCheckEndDate: '2020-02-01T21:00:00.000Z',
  };
}

let scheduleData: ReturnType<typeof makeItem>[] = [];

describe('<SchedulePage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reactUseState.mobile = false;
    scheduleData = [makeItem(0, StatusEnum.Missed, TagEnum.Coding), makeItem(1, StatusEnum.Done, TagEnum.Test)];
    getSchedule.mockResolvedValue({ data: scheduleData });
    getScheduleICalendarToken.mockResolvedValue({ data: { token: 'cal-token' } });
    createCourseTask.mockResolvedValue({});
    copySchedule.mockResolvedValue({});
    isCourseManager.mockReturnValue(true);
  });

  it('renders the page title, status tabs and the schedule table rows', async () => {
    render(<SchedulePage />);

    // PageLayout's Header renders the title (+ course name) as plain text, not a heading role.
    expect(await screen.findByText(/schedule/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByText('Course Item 0')).toBeInTheDocument();
    expect(screen.getByText('Course Item 1')).toBeInTheDocument();
  });

  it('fetches the schedule and the ical token for the active course on mount', async () => {
    render(<SchedulePage />);

    await waitFor(() => expect(getSchedule).toHaveBeenCalledWith(42));
    expect(getScheduleICalendarToken).toHaveBeenCalledWith(42);
  });

  it('shows the SettingsPanel with manager actions when the user is a course manager', async () => {
    render(<SchedulePage />);

    expect(await screen.findByTestId('Task')).toBeInTheDocument();
    expect(screen.getByTestId('Event')).toBeInTheDocument();
  });

  it('hides task/event creation when the user is not a course manager', async () => {
    isCourseManager.mockReturnValue(false);
    render(<SchedulePage />);

    await screen.findByText('Course Item 0');
    expect(screen.queryByTestId('Task')).not.toBeInTheDocument();
    expect(screen.queryByTestId('Event')).not.toBeInTheDocument();
  });

  it('does not render the SettingsPanel in mobile view', async () => {
    reactUseState.mobile = true;
    render(<SchedulePage />);

    await screen.findByText('Course Item 0');
    expect(screen.queryByTestId('Task')).not.toBeInTheDocument();
  });

  it('opens the task modal, submits it, creates the task and refreshes', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />);

    await user.click(await screen.findByTestId('Task'));
    const modal = await screen.findByTestId('course-task-modal');
    await user.click(within(modal).getByText('submit-task'));

    await waitFor(() => expect(createCourseTask).toHaveBeenCalledWith(42, { name: 'task' }));
    await waitFor(() => expect(reactUseState.retry).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByTestId('course-task-modal')).not.toBeInTheDocument());
  });

  it('closes the task modal without creating a task when cancelled', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />);

    await user.click(await screen.findByTestId('Task'));
    const modal = await screen.findByTestId('course-task-modal');
    await user.click(within(modal).getByText('cancel-task'));

    await waitFor(() => expect(screen.queryByTestId('course-task-modal')).not.toBeInTheDocument());
    expect(createCourseTask).not.toHaveBeenCalled();
  });

  it('opens the event modal, submits it and refreshes', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />);

    await user.click(await screen.findByTestId('Event'));
    const modal = await screen.findByTestId('course-event-modal');
    await user.click(within(modal).getByText('submit-event'));

    await waitFor(() => expect(reactUseState.retry).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByTestId('course-event-modal')).not.toBeInTheDocument());
  });

  it('closes the event modal without refreshing when cancelled', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />);

    await user.click(await screen.findByTestId('Event'));
    const modal = await screen.findByTestId('course-event-modal');
    await user.click(within(modal).getByText('cancel-event'));

    await waitFor(() => expect(screen.queryByTestId('course-event-modal')).not.toBeInTheDocument());
  });

  it('closes the copy modal without copying when cancelled', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />);

    await user.click(await screen.findByTestId('More'));
    await user.click(await screen.findByRole('menuitem', { name: /copy from/i }));

    const modal = await screen.findByTestId('copy-modal');
    await user.click(within(modal).getByText('cancel-copy'));

    await waitFor(() => expect(screen.queryByTestId('copy-modal')).not.toBeInTheDocument());
    expect(copySchedule).not.toHaveBeenCalled();
  });

  it('copies the schedule from another course and refreshes', async () => {
    const user = userEvent.setup();
    render(<SchedulePage />);

    // The "Copy from another course" action lives in the SettingsPanel "More" menu.
    await user.click(await screen.findByTestId('More'));
    const copyItem = await screen.findByRole('menuitem', { name: /copy from/i });
    await user.click(copyItem);

    const modal = await screen.findByTestId('copy-modal');
    await user.click(within(modal).getByText('submit-copy'));

    await waitFor(() => expect(copySchedule).toHaveBeenCalledWith(42, { copyFromCourseId: 7 }));
    await waitFor(() => expect(reactUseState.retry).toHaveBeenCalled());
  });
});
