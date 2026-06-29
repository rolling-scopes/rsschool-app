import { fireEvent, render, screen, within } from '@testing-library/react';
import StudentStatsModal from '../StudentStatsModal';
import { StudentStats } from '@common/models/profile';

describe('StudentStatsModal', () => {
  it('Should render correctly', () => {
    const stats: StudentStats = {
      courseId: 1,
      courseName: 'rs-2018-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2018 Q1',
      isExpelled: false,
      isSelfExpelled: false,
      expellingReason: '',
      isCourseCompleted: true,
      totalScore: 1201,
      certificateId: 'asd',
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
    };

    const { container } = render(<StudentStatsModal stats={stats} isVisible={true} onHide={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });

  const baseStats = (overrides: Partial<StudentStats> = {}): StudentStats => ({
    courseId: 1,
    courseName: 'rs-2018-q1',
    locationName: 'Minsk',
    courseFullName: 'Rolling Scopes School 2018 Q1',
    isExpelled: false,
    isSelfExpelled: false,
    expellingReason: '',
    isCourseCompleted: true,
    totalScore: 1201,
    certificateId: 'asd',
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
    ],
    ...overrides,
  });

  it('renders mentor link, rank, total score with max and expelling reason when all present', () => {
    render(
      <StudentStatsModal
        stats={baseStats({ isExpelled: true, expellingReason: 'No activity' })}
        isVisible
        onHide={vi.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: 'Andrey Andreev' })).toHaveAttribute('href', '/profile?githubId=andrew123');
    expect(screen.getByText('Position:')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    // maxScore present on every task -> max course score computed (130 * 1 = 130.0)
    expect(screen.getByText(/\/ 130\.0/)).toBeInTheDocument();
    expect(screen.getByText(/Expelling reason: No activity/)).toBeInTheDocument();
  });

  it('hides mentor link, rank, max score and expelling reason when absent/falsy', () => {
    const stats = baseStats({
      mentor: { githubId: '', name: 'No Github' },
      rank: 0,
      isExpelled: false,
      expellingReason: 'ignored because not expelled',
      tasks: [
        {
          // maxScore 0 -> tasks.every(maxScore) is false -> maxCourseScore = null
          maxScore: 0,
          scoreWeight: 1,
          name: 'Plain Task',
          descriptionUri: '',
          githubPrUri: '',
          score: null as unknown as number,
          comment: '',
        },
      ],
    });
    render(<StudentStatsModal stats={stats} isVisible onHide={vi.fn()} />);

    expect(screen.queryByRole('link', { name: 'No Github' })).not.toBeInTheDocument();
    expect(screen.queryByText('Position:')).not.toBeInTheDocument();
    // no " / <maxCourseScore>" appended after total score (maxCourseScore is null)
    expect(screen.queryByText(/\/ \d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Expelling reason:/)).not.toBeInTheDocument();
  });

  it('renders task columns alternate branches: no descriptionUri, null score, no maxScore, no githubPrUri', () => {
    const stats = baseStats({
      tasks: [
        {
          maxScore: 0,
          scoreWeight: 2,
          name: 'Plain Task',
          descriptionUri: '',
          githubPrUri: '',
          score: null as unknown as number,
          comment: 'a comment',
        },
      ],
    });
    render(<StudentStatsModal stats={stats} isVisible onHide={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    // task name rendered as plain text (no link) because descriptionUri is empty
    expect(within(dialog).queryByRole('link', { name: 'Plain Task' })).not.toBeInTheDocument();
    expect(within(dialog).getByText('Plain Task')).toBeInTheDocument();
    // score null -> "-" rendered, maxScore 0 -> "-" rendered (Modal content lives in a portal)
    expect(within(dialog).getAllByText('-').length).toBeGreaterThan(0);
    // scoreWeight rendered as "*2" without the weighted computation (score falsy)
    expect(within(dialog).getByText('*2')).toBeInTheDocument();
    // no PR link because githubPrUri empty
    expect(within(dialog).queryByRole('link', { name: 'PR' })).not.toBeInTheDocument();
  });

  it('renders task columns truthy branches: descriptionUri link, score weighted, PR link', () => {
    const stats = baseStats({
      tasks: [
        {
          maxScore: 100,
          scoreWeight: 2,
          name: 'Linked Task',
          descriptionUri: 'https://task.example',
          githubPrUri: 'https://pr.example',
          score: 50,
          comment: 'c',
        },
      ],
    });
    render(<StudentStatsModal stats={stats} isVisible onHide={vi.fn()} />);

    expect(screen.getByRole('link', { name: 'Linked Task' })).toHaveAttribute('href', 'https://task.example');
    expect(screen.getByRole('link', { name: 'PR' })).toHaveAttribute('href', 'https://pr.example');
    // score 50 * weight 2 = 100.00 displayed
    expect(screen.getByText('100.00')).toBeInTheDocument();
    // score / max cell shows the actual score and maxScore
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('calls onHide when modal cancel/close is triggered', () => {
    const onHide = vi.fn();
    render(<StudentStatsModal stats={baseStats()} isVisible onHide={onHide} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(onHide).toHaveBeenCalled();
  });
});
