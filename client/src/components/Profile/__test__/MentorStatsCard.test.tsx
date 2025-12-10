import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MentorStatsCard } from '../MentorStatsCard';

jest.mock('modules/Profile/components/MentorEndorsement', () => ({
  MentorEndorsement: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div>
      {open ? <div data-testid="endorsement-open">endorsement-open</div> : null}
      <button onClick={onClose}>mock-close-endorsement</button>
    </div>
  ),
}));

describe('MentorStatsCard', () => {
  const mentorStats = [
    {
      courseName: 'rs-2018-q1',
      courseLocationName: 'Minsk',
      students: [
        {
          githubId: 'alex',
          name: 'Alex Petrov',
          isExpelled: false,
          totalScore: 3453,
          repoUrl: 'https://github.com/rolling-scopes-school/alex-RS2018Q1',
        },
        {
          githubId: 'vasya',
          name: 'Vasiliy Alexandrov',
          isExpelled: true,
          totalScore: 120,
          repoUrl: 'https://github.com/rolling-scopes-school/vasya-RS2018Q1',
        },
      ],
    },
    {
      courseName: 'rs-2020-q1',
      courseLocationName: 'Minsk',
    },
  ];

  it('shows stats', () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} />);
    expect(screen.getByText('Mentored Students:')).toBeInTheDocument();
    expect(screen.getByText('Courses as Mentor:')).toBeInTheDocument();
  });

  it('shows all courses', () => {
    const courseNames = mentorStats.map(course => course.courseName);
    render(<MentorStatsCard githubId="test" data={mentorStats} />);
    courseNames.forEach(course => expect(screen.getByText(course)).toBeInTheDocument());
  });

  it('shows details button for courses with students', () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} />);
    const coursesWithStudents = mentorStats.reduce((acc, c) => (c?.students?.length ? acc + 1 : acc), 0);
    const openButtons = screen.queryAllByTitle('Open details');
    expect(openButtons.length).toBe(coursesWithStudents);
  });

  it('shows dedicated message if no there are no students in the course', () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} />);
    expect(screen.getByText('rs-2020-q1')).toBeInTheDocument();
    expect(screen.getByText('Does not have students at this course yet')).toBeInTheDocument();
  });

  it('shows endorsement button for admins', () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} isAdmin={true} />);
    expect(screen.getByRole('button', { name: /Get Endorsement/i })).toBeInTheDocument();
  });

  it('do not shows endorsement button for non-admin users', () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} isAdmin={false} />);
    expect(screen.queryByRole('button', { name: /Get Endorsement/i })).not.toBeInTheDocument();
  });

  it('opens MentorStatsModal for a course with students when expand is clicked', () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} />);

    const expandBtn = screen.getByTestId('expand-button');
    fireEvent.click(expandBtn);

    expect(screen.getByText('rs-2018-q1 statistics')).toBeInTheDocument();
  });

  it('closes MentorStatsModal when Close is clicked', async () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} />);

    fireEvent.click(screen.getByTestId('expand-button'));
    expect(screen.getByText('rs-2018-q1 statistics')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close'));
    await waitFor(() => expect(screen.getByText('rs-2018-q1 statistics')).not.toBeVisible());
  });

  it('renders students list for the first course when it has students', () => {
    render(<MentorStatsCard githubId="gh" data={mentorStats} />);

    expect(screen.getByRole('link', { name: 'Alex Petrov' })).toHaveAttribute('href', '/profile?githubId=alex');
    expect(screen.getAllByText('Score:').length).toBe(2);
    expect(screen.getByText('3453')).toBeInTheDocument();
  });

  it('opens and closes MentorEndorsement modal via the admin button', () => {
    render(<MentorStatsCard githubId="mentor" data={mentorStats} isAdmin={true} />);

    fireEvent.click(screen.getByRole('button', { name: /Get Endorsement/i }));
    expect(screen.getByTestId('endorsement-open')).toBeInTheDocument();

    fireEvent.click(screen.getByText('mock-close-endorsement'));
    expect(screen.queryByTestId('endorsement-open')).not.toBeInTheDocument();
  });
});
