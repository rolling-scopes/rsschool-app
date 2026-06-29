import { render, screen, waitFor } from '@testing-library/react';
import { MentorStatsCard } from '../MentorStatsCard';
import userEvent from '@testing-library/user-event';

vi.mock('@client/modules/Profile/components/MentorEndorsement', () => ({
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
        },
        {
          githubId: 'vasya',
          name: 'Vasiliy Alexandrov',
          isExpelled: true,
          totalScore: 120,
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

  it('opens MentorStatsModal for a course with students when expand is clicked', async () => {
    render(<MentorStatsCard githubId="test" data={mentorStats} />);
    const user = userEvent.setup();

    const expandBtn = screen.getByTestId('expand-button');
    await user.click(expandBtn);

    expect(screen.getByText('rs-2018-q1 statistics')).toBeInTheDocument();
  });

  it('closes MentorStatsModal when Close is clicked', async () => {
    const { unmount } = render(<MentorStatsCard githubId="test" data={mentorStats} />);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('expand-button'));
    expect(screen.getByText('rs-2018-q1 statistics')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    unmount();
    await waitFor(() => expect(screen.queryByText('rs-2018-q1 statistics')).not.toBeInTheDocument());
  });

  it('renders students list for the first course when it has students', () => {
    render(<MentorStatsCard githubId="gh" data={mentorStats} />);

    expect(screen.getByRole('link', { name: 'Alex Petrov' })).toHaveAttribute('href', '/profile?githubId=alex');
    expect(screen.getAllByText('Score:').length).toBe(2);
    expect(screen.getByText('3453')).toBeInTheDocument();
  });

  it('opens and closes MentorEndorsement modal via the admin button', async () => {
    render(<MentorStatsCard githubId="mentor" data={mentorStats} isAdmin={true} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Get Endorsement/i }));
    expect(screen.getByTestId('endorsement-open')).toBeInTheDocument();

    await user.click(screen.getByText('mock-close-endorsement'));
    expect(screen.queryByTestId('endorsement-open')).not.toBeInTheDocument();
  });

  it('does not render MentorStatsModal when there are no courses (stats[courseIndex] undefined)', () => {
    render(<MentorStatsCard githubId="test" data={[]} />);
    // count is 0 and there are no course cards
    expect(screen.getByText('Mentored Students:')).toBeInTheDocument();
    expect(screen.queryByTestId('expand-button')).not.toBeInTheDocument();
    // MentorStatsModal not rendered -> no statistics title
    expect(screen.queryByText(/statistics/)).not.toBeInTheDocument();
  });

  it('renders students count text (not a list) for non-first courses that have students', () => {
    const data = [
      mentorStats[0],
      {
        courseName: 'rs-2019-q2',
        courseLocationName: 'Minsk',
        students: [
          { githubId: 'kate', name: 'Kate Smith', isExpelled: false, totalScore: 500 },
          { githubId: 'tom', name: 'Tom Jones', isExpelled: false, totalScore: 400 },
        ],
      },
    ];
    render(<MentorStatsCard githubId="test" data={data} />);

    // second course (idx 1) with students renders the count text, not individual links
    expect(screen.getByText(/Students number:/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Kate Smith' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tom Jones' })).not.toBeInTheDocument();
  });

  it('renders a course card without expand button when course has no students', () => {
    const data = [
      {
        courseName: 'rs-empty',
        courseLocationName: '',
        // no students -> extra (ExpandButtonWidget) not rendered, message shown
      },
    ];
    render(<MentorStatsCard githubId="test" data={data} />);

    expect(screen.getByText('Does not have students at this course yet')).toBeInTheDocument();
    expect(screen.queryByTestId('expand-button')).not.toBeInTheDocument();
  });
});
