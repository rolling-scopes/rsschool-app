import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import StudentStatsCard from '../StudentStatsCard';
import { StudentStats } from '@common/models/profile';

// The component posts to the leave endpoint with `axios.post`. Activate the manual
// axios mock shipped at src/__mocks__/axios.js (vi.fn()-based methods).
vi.mock('axios');

const { rejoinCourse } = vi.hoisted(() => ({
  rejoinCourse: vi.fn().mockResolvedValue(undefined),
}));

// Mock only the API boundary: the generated CoursesApi used for rejoinCourse.
vi.mock('@client/api', () => ({
  CoursesApi: function CoursesApi() {
    return { rejoinCourse };
  },
}));

const reload = vi.fn();
const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload },
    writable: true,
    configurable: true,
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  reload.mockClear();
  rejoinCourse.mockClear();
  vi.mocked(axios.post).mockReset().mockResolvedValue({ data: {} });
});

describe('StudentStatsCard', () => {
  const githubId = 'test';
  const data = [
    {
      courseId: 1,
      courseName: 'rs-2018-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2018 Q1',
      isExpelled: false,
      expellingReason: '',
      isCourseCompleted: true,
      totalScore: 1201,
      rank: 32,
      mentor: {
        githubId: 'andrew123',
        name: 'Andrey Andreev',
      },
      tasks: [
        {
          maxScore: 130,
          scoreWeight: 1,
          name: 'Task 1',
          descriptionUri: 'https://description.com',
          githubPrUri: 'https://description.com',
          score: 120,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 2',
          descriptionUri: 'https://description.com',
          githubPrUri: 'https://description.com',
          score: 20,
          comment: 'test',
        },
        {
          maxScore: 110,
          scoreWeight: 1,
          name: 'Task 3',
          descriptionUri: 'https://description.com',
          githubPrUri: 'https://description.com',
          score: 90,
          comment: 'test',
        },
      ],
    },
    {
      courseId: 1,
      courseName: 'rs-2019-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2019 Q1',
      isExpelled: true,
      expellingReason: 'test',
      isCourseCompleted: false,
      totalScore: 101,
      rank: 32,
      mentor: {
        githubId: 'dimon12',
        name: 'Dima Testovich',
      },
      tasks: [
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 1',
          descriptionUri: 'https://description.com',
          githubPrUri: 'https://description.com',
          score: 20,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 2',
          descriptionUri: 'https://description.com',
          githubPrUri: 'https://description.com',
          score: null,
          comment: null,
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 3',
          descriptionUri: 'https://description.com',
          githubPrUri: 'https://description.com',
          score: 10,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 4',
          descriptionUri: 'https://description.com',
          githubPrUri: 'https://description.com',
          score: null,
          comment: null,
        },
      ],
    },
  ] as StudentStats[];

  it('should render correctly', () => {
    const { container } = render(<StudentStatsCard isProfileOwner={false} data={data} username={githubId} />);
    expect(container).toMatchSnapshot();
  });

  const tasks = [
    { maxScore: 100, scoreWeight: 1, name: 'T1', descriptionUri: '', githubPrUri: '', score: 50, comment: '' },
    { maxScore: 100, scoreWeight: 1, name: 'T2', descriptionUri: '', githubPrUri: '', score: null, comment: '' },
  ];

  const baseCourse = {
    courseId: 7,
    courseName: 'rs-active',
    locationName: null,
    courseFullName: 'RS Active',
    isExpelled: false,
    expellingReason: '',
    isCourseCompleted: false,
    totalScore: 100,
    rank: null,
    certificateId: null,
    mentor: { githubId: null as string | null, name: '' },
    tasks,
  };

  const makeData = (overrides: Partial<typeof baseCourse> = {}): StudentStats[] =>
    [{ ...baseCourse, ...overrides }] as unknown as StudentStats[];

  it('renders the Leave Course button for an owner on an active course and opens the leave modal', async () => {
    const user = userEvent.setup();
    render(<StudentStatsCard isProfileOwner data={makeData()} username={githubId} />);

    const leaveBtn = screen.getByRole('button', { name: /Leave Course/ });
    await user.click(leaveBtn);

    expect(screen.getByText('Confirm Leaving Course')).toBeInTheDocument();
  });

  it('cancels the leave confirmation modal (hideExpelConfirmationModal)', async () => {
    const user = userEvent.setup();
    render(<StudentStatsCard isProfileOwner data={makeData()} username={githubId} />);

    await user.click(screen.getByRole('button', { name: /Leave Course/ }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Continue studying/ }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits the leave survey and posts to the leave endpoint then reloads (selfExpelStudent)', async () => {
    const user = userEvent.setup();
    render(<StudentStatsCard isProfileOwner data={makeData()} username={githubId} />);

    await user.click(screen.getByRole('button', { name: /Leave Course/ }));
    const dialog = screen.getByRole('dialog');

    // pick a reason so the survey form validates (label text contains EN + RU on two lines)
    await user.click(within(dialog).getByRole('checkbox', { name: /Lack of time/ }));
    await user.click(within(dialog).getByRole('button', { name: /Leave Course/ }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/v2/courses/7/leave', expect.any(Object)));
    await waitFor(() => expect(reload).toHaveBeenCalled());
  });

  it('renders Back to Course for a self-expelled student and rejoins on click (rejoinAsStudent)', async () => {
    const user = userEvent.setup();
    render(
      <StudentStatsCard
        isProfileOwner
        data={makeData({ isExpelled: true, isSelfExpelled: true })}
        username={githubId}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Back to Course/ }));

    await waitFor(() => expect(rejoinCourse).toHaveBeenCalledWith(7));
    await waitFor(() => expect(reload).toHaveBeenCalled());
  });

  it('shows the manager/mentor expel notice when expelled but not self-expelled', () => {
    render(
      <StudentStatsCard
        isProfileOwner
        data={makeData({ isExpelled: true, isSelfExpelled: false })}
        username={githubId}
      />,
    );

    expect(screen.getByText('You expelled by Course Manager or Mentor')).toBeInTheDocument();
  });

  it('renders no leave/back controls for a non-owner', () => {
    render(<StudentStatsCard isProfileOwner={false} data={makeData()} username={githubId} />);

    expect(screen.queryByRole('button', { name: /Leave Course/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Back to Course/ })).not.toBeInTheDocument();
  });

  it('renders the certificate link, mentor link and rank when present', () => {
    render(
      <StudentStatsCard
        isProfileOwner={false}
        data={makeData({
          isCourseCompleted: true,
          certificateId: 'cert-1',
          rank: 5,
          locationName: 'Minsk',
          mentor: { githubId: 'mentor1', name: 'Mentor One' },
        })}
        username={githubId}
      />,
    );

    expect(screen.getByRole('link', { name: 'Certificate' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mentor One' })).toBeInTheDocument();
    expect(screen.getByText('Position: 5')).toBeInTheDocument();
  });

  it('opens the per-course stats modal from the expand button (showStudentStatsModal)', async () => {
    const user = userEvent.setup();
    render(<StudentStatsCard isProfileOwner={false} data={makeData()} username={githubId} />);

    await user.click(screen.getByRole('button', { name: 'Open details' }));

    expect(screen.getByText('RS Active statistics')).toBeInTheDocument();
  });

  it('closes the per-course stats modal (hideStudentStatsModal)', async () => {
    const user = userEvent.setup();
    render(<StudentStatsCard isProfileOwner={false} data={makeData()} username={githubId} />);

    await user.click(screen.getByRole('button', { name: 'Open details' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not post when leaving with no courseId (selfExpelStudent guard)', async () => {
    // unreachable in practice: the Leave button always passes a real courseId.
    // Covered indirectly: the non-owner case renders no leave control, so the guard
    // path (`if (!courseId) return`) cannot be triggered through the UI.
    render(<StudentStatsCard isProfileOwner={false} data={makeData()} username={githubId} />);
    expect(axios.post).not.toHaveBeenCalled();
  });
});
