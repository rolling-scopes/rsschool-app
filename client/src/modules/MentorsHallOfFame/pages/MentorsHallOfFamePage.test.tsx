import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { TopMentorDto } from '@client/api';

vi.mock('next/config', () => () => ({}));
const mockedGetTopMentors = vi.fn();
vi.mock('../services/mentors-hall-of-fame.service', () => ({
  MentorsHallOfFameService: class {
    getTopMentors(...args: unknown[]) {
      return mockedGetTopMentors(...args);
    }
  },
}));

import { MentorsHallOfFamePage } from './MentorsHallOfFamePage';

const lastYearMentors: TopMentorDto[] = [
  {
    rank: 1,
    githubId: 'mentor-last-year',
    name: 'Last Year Mentor',
    totalStudents: 5,
    totalGratitudes: 2,
    courseStats: [{ courseName: 'JS', studentsCount: 5 }],
  },
];

const allTimeMentors: TopMentorDto[] = [
  {
    rank: 1,
    githubId: 'mentor-all-time',
    name: 'All Time Mentor',
    totalStudents: 50,
    totalGratitudes: 20,
    courseStats: [{ courseName: 'React', studentsCount: 50 }],
  },
];

describe('MentorsHallOfFamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetTopMentors.mockReset();
    mockedGetTopMentors.mockResolvedValue([]);
  });

  it('loads and renders the page title and mentors list', async () => {
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors);

    render(<MentorsHallOfFamePage />);

    expect(await screen.findByText('Mentors Hall of Fame')).toBeInTheDocument();
    expect(await screen.findByText('Last Year Mentor')).toBeInTheDocument();
    expect(screen.getByText('@mentor-last-year')).toBeInTheDocument();
    expect(mockedGetTopMentors).toHaveBeenCalledWith(false);
  });

  it('shows loading state during request', async () => {
    let resolveRequest: (value: TopMentorDto[]) => void = () => {};
    const pendingPromise = new Promise<TopMentorDto[]>(resolve => {
      resolveRequest = resolve;
    });
    mockedGetTopMentors.mockReturnValueOnce(pendingPromise);

    render(<MentorsHallOfFamePage />);

    expect(screen.getByText('Loading top mentors...')).toBeInTheDocument();

    resolveRequest(lastYearMentors);
    expect(await screen.findByText('Last Year Mentor')).toBeInTheDocument();
  });

  it('switches period, updates the description and refetches all-time mentors', async () => {
    const user = setupUser();
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors).mockResolvedValueOnce(allTimeMentors);

    render(<MentorsHallOfFamePage />);

    await screen.findByText('Last Year Mentor');
    expect(
      screen.getByText(
        'Celebrating our top mentors who guided the most students to receive certificates in the last year',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByText('All Time'));

    await waitFor(() => {
      expect(mockedGetTopMentors).toHaveBeenNthCalledWith(2, true);
    });
    expect(await screen.findByText('All Time Mentor')).toBeInTheDocument();
    expect(
      screen.getByText('Celebrating our top mentors who guided the most students to receive certificates'),
    ).toBeInTheDocument();

    expect(mockedGetTopMentors).toHaveBeenCalledTimes(2);
    expect(mockedGetTopMentors).toHaveBeenNthCalledWith(1, false);
  });

  it('renders empty state when there are no mentors', async () => {
    mockedGetTopMentors.mockResolvedValueOnce([]);

    render(<MentorsHallOfFamePage />);

    expect(await screen.findByText('No mentors found')).toBeInTheDocument();
  });

  it('handles request error and shows empty state', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();
    mockedGetTopMentors.mockRejectedValueOnce(new Error('Request failed'));

    render(<MentorsHallOfFamePage />);

    expect(await screen.findByText('No mentors found')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch top mentors:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
