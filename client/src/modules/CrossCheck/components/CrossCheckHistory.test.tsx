import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrossCheckSolutionReviewDto } from '@client/api';
import { markdownLabel } from '@client/shared/components/Forms/PreparedComment';
import { CrossCheckHistory } from './CrossCheckHistory';

// Stub the heavy SolutionReview tree (CourseService + react-markdown); it is unit
// tested separately. Render its children so the "Amend comment" button is exercised.
vi.mock('@client/modules/CrossCheck/components/SolutionReview', () => ({
  SolutionReview: ({ children, review }: { children?: JSX.Element; review: CrossCheckSolutionReviewDto }) => (
    <div data-testid="solution-review">
      <span>review-score-{review.score}</span>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/CrossCheck/components/SolutionReviewSettingsPanel', () => ({
  SolutionReviewSettingsPanel: () => <div data-testid="settings-panel" />,
}));

function review(overrides: Partial<CrossCheckSolutionReviewDto> = {}): CrossCheckSolutionReviewDto {
  return {
    id: 1,
    dateTime: 1700000000000,
    comment: `${markdownLabel}Great job`,
    score: 70,
    author: { id: 1, githubId: 'reviewer-gh', discord: null },
    messages: [],
    criteria: [],
    ...overrides,
  } as CrossCheckSolutionReviewDto;
}

function makeProps(overrides: Partial<React.ComponentProps<typeof CrossCheckHistory>> = {}) {
  return {
    sessionId: 1,
    courseId: 42,
    courseTaskId: 7,
    state: { loading: false, data: [review()] },
    sessionGithubId: 'session-gh',
    maxScore: 100,
    setHistoricalCommentSelected: vi.fn(),
    ...overrides,
  };
}

describe('<CrossCheckHistory />', () => {
  it('renders the History heading', () => {
    render(<CrossCheckHistory {...makeProps()} />);

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
  });

  it('renders one SolutionReview per review in the timeline', () => {
    render(
      <CrossCheckHistory
        {...makeProps({ state: { loading: false, data: [review({ score: 70 }), review({ score: 40 })] } })}
      />,
    );

    expect(screen.getAllByTestId('solution-review')).toHaveLength(2);
    expect(screen.getByText('review-score-70')).toBeInTheDocument();
    expect(screen.getByText('review-score-40')).toBeInTheDocument();
  });

  it('marks the first review as the active review and the rest as outdated', () => {
    render(<CrossCheckHistory {...makeProps({ state: { loading: false, data: [review(), review()] } })} />);

    expect(screen.getByText('active review')).toBeInTheDocument();
    expect(screen.getByText('outdated review')).toBeInTheDocument();
  });

  it('shows the settings panel only when there is review data', () => {
    const { rerender } = render(<CrossCheckHistory {...makeProps()} />);
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();

    rerender(<CrossCheckHistory {...makeProps({ state: { loading: false, data: [] } })} />);
    expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
  });

  it('amends a comment (stripped of the markdown label) when the amend button is clicked', async () => {
    const user = userEvent.setup();
    const setHistoricalCommentSelected = vi.fn();
    render(<CrossCheckHistory {...makeProps({ setHistoricalCommentSelected })} />);

    await user.click(screen.getByRole('button', { name: /Amend comment/ }));

    expect(setHistoricalCommentSelected).toHaveBeenCalledWith('Great job');
  });
});
