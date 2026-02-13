import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopMentorDto } from 'api';

jest.mock('next/config', () => () => ({}));
const mockedGetTopMentors = jest.fn();
jest.mock('../services/mentors-hall-of-fame.service', () => ({
  MentorsHallOfFameService: jest.fn().mockImplementation(() => ({
    getTopMentors: (...args: unknown[]) => mockedGetTopMentors(...args),
  })),
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
    jest.clearAllMocks();
    mockedGetTopMentors.mockReset();
    mockedGetTopMentors.mockResolvedValue([]);
  });

  it('renders page title', async () => {
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors);

    render(<MentorsHallOfFamePage />);

    expect(await screen.findByText('Mentors Hall of Fame')).toBeInTheDocument();
  });

  it('loads mentors data on mount', async () => {
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors);

    render(<MentorsHallOfFamePage />);

    await waitFor(() => {
      expect(mockedGetTopMentors).toHaveBeenCalledWith(false);
    });
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

  it('renders mentors list after successful load', async () => {
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors);

    render(<MentorsHallOfFamePage />);

    expect(await screen.findByText('Last Year Mentor')).toBeInTheDocument();
    expect(screen.getByText('@mentor-last-year')).toBeInTheDocument();
  });

  it('switches period from lastYear to allTime', async () => {
    const user = userEvent.setup();
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors).mockResolvedValueOnce(allTimeMentors);

    render(<MentorsHallOfFamePage />);

    await screen.findByText('Last Year Mentor');

    await user.click(screen.getByText('All Time'));

    await waitFor(() => {
      expect(mockedGetTopMentors).toHaveBeenNthCalledWith(2, true);
    });
    expect(await screen.findByText('All Time Mentor')).toBeInTheDocument();
  });

  it('updates description when period changes', async () => {
    const user = userEvent.setup();
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors).mockResolvedValueOnce(allTimeMentors);

    render(<MentorsHallOfFamePage />);

    expect(
      await screen.findByText(
        'Celebrating our top mentors who guided the most students to receive certificates in the last year',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByText('All Time'));

    expect(
      await screen.findByText('Celebrating our top mentors who guided the most students to receive certificates'),
    ).toBeInTheDocument();
  });

  it('renders empty state when there are no mentors', async () => {
    mockedGetTopMentors.mockResolvedValueOnce([]);

    render(<MentorsHallOfFamePage />);

    expect(await screen.findByText('No mentors found')).toBeInTheDocument();
  });

  it('handles request error and shows empty state', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedGetTopMentors.mockRejectedValueOnce(new Error('Request failed'));

    render(<MentorsHallOfFamePage />);

    expect(await screen.findByText('No mentors found')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch top mentors:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('refetches mentors when period changes', async () => {
    const user = userEvent.setup();
    mockedGetTopMentors.mockResolvedValueOnce(lastYearMentors).mockResolvedValueOnce(allTimeMentors);

    render(<MentorsHallOfFamePage />);

    await screen.findByText('Last Year Mentor');

    await user.click(screen.getByText('All Time'));

    await waitFor(() => {
      expect(mockedGetTopMentors).toHaveBeenCalledTimes(2);
    });
    expect(mockedGetTopMentors).toHaveBeenNthCalledWith(1, false);
    expect(mockedGetTopMentors).toHaveBeenNthCalledWith(2, true);
  });
});
