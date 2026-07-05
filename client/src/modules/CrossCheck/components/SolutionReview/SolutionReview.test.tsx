import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CrossCheckCriteriaDataDtoTypeEnum,
  CrossCheckMessageDtoRoleEnum,
  CrossCheckSolutionReviewDto,
} from '@client/api';
import SolutionReview, { SolutionReviewProps } from './SolutionReview';

// react-markdown is a heavy ESM module (used by PreparedComment + MessageSendingPanel).
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));

// Mock the CourseService boundary so we can assert the message/notification calls.
const { postTaskSolutionResultMessages, updateTaskSolutionResultMessages } = vi.hoisted(() => ({
  postTaskSolutionResultMessages: vi.fn().mockResolvedValue({}),
  updateTaskSolutionResultMessages: vi.fn().mockResolvedValue({}),
}));

vi.mock('@client/services/course', () => ({
  CourseService: class {
    postTaskSolutionResultMessages = postTaskSolutionResultMessages;
    updateTaskSolutionResultMessages = updateTaskSolutionResultMessages;
  },
}));

function makeReview(overrides: Partial<CrossCheckSolutionReviewDto> = {}): CrossCheckSolutionReviewDto {
  return {
    id: 10,
    dateTime: 1700000000000,
    comment: 'Nice solution',
    score: 80,
    author: { id: 1, githubId: 'reviewer-gh', discord: null },
    messages: [],
    criteria: [],
    ...overrides,
  } as CrossCheckSolutionReviewDto;
}

function makeProps(overrides: Partial<SolutionReviewProps> = {}): SolutionReviewProps {
  return {
    sessionId: 99,
    sessionGithubId: 'session-gh',
    courseId: 42,
    reviewNumber: 0,
    settings: { areContactsVisible: true },
    courseTaskId: 7,
    review: makeReview(),
    isActiveReview: true,
    currentRole: CrossCheckMessageDtoRoleEnum.Reviewer,
    maxScore: 100,
    ...overrides,
  };
}

describe('<SolutionReview />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the score, max score and the reviewer comment', () => {
    render(<SolutionReview {...makeProps()} />);

    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('maximum score: 100')).toBeInTheDocument();
    expect(screen.getByText('Nice solution')).toBeInTheDocument();
  });

  it('shows "unknown" when no max score is provided', () => {
    render(<SolutionReview {...makeProps({ maxScore: undefined })} />);

    expect(screen.getByText('maximum score: unknown')).toBeInTheDocument();
  });

  it('opens a detailed-feedback modal when criteria are present', async () => {
    const user = userEvent.setup();
    render(
      <SolutionReview
        {...makeProps({
          review: makeReview({
            criteria: [
              {
                key: 's1',
                text: 'Subtask in feedback',
                type: CrossCheckCriteriaDataDtoTypeEnum.Subtask,
                point: 5,
                max: 10,
              },
            ],
          }),
        })}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show detailed feedback' }));

    expect(await screen.findByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Subtask in feedback')).toBeInTheDocument();
  });

  it('does not render the detailed-feedback button when there are no criteria', () => {
    render(<SolutionReview {...makeProps()} />);

    expect(screen.queryByRole('button', { name: 'Show detailed feedback' })).not.toBeInTheDocument();
  });

  it('sends a message through the course service with the markdown label', async () => {
    const user = userEvent.setup();
    render(<SolutionReview {...makeProps()} />);

    await user.click(screen.getByPlaceholderText('Leave a message'));
    await user.type(screen.getByRole('textbox'), 'Well done');
    await user.click(screen.getByRole('button', { name: /Send message/ }));

    await waitFor(() => {
      expect(postTaskSolutionResultMessages).toHaveBeenCalledWith(
        10,
        7,
        expect.objectContaining({
          content: expect.stringContaining('Well done'),
          role: CrossCheckMessageDtoRoleEnum.Reviewer,
        }),
      );
    });
  });

  it('marks unread messages as read on mount', async () => {
    render(
      <SolutionReview
        {...makeProps({
          currentRole: CrossCheckMessageDtoRoleEnum.Reviewer,
          review: makeReview({
            messages: [
              {
                author: { id: 2, githubId: 'student-gh' },
                content: 'A question',
                timestamp: '2024-01-01T00:00:00.000Z',
                isReviewerRead: false,
                isStudentRead: true,
                role: CrossCheckMessageDtoRoleEnum.Student,
              },
            ],
          }),
        })}
      />,
    );

    await waitFor(() => {
      expect(updateTaskSolutionResultMessages).toHaveBeenCalledWith(
        10,
        7,
        expect.objectContaining({ role: CrossCheckMessageDtoRoleEnum.Reviewer }),
      );
    });
    expect(screen.getAllByText('You have 1 unread message').length).toBeGreaterThan(0);
  });

  it('hides the message-sending panel when isMessageSendingPanelVisible is false', () => {
    render(<SolutionReview {...makeProps({ isMessageSendingPanelVisible: false })} />);

    expect(screen.queryByPlaceholderText('Leave a message')).not.toBeInTheDocument();
  });

  it('renders children passed to the review (e.g. amend button)', () => {
    render(
      <SolutionReview {...makeProps()}>
        <button>Amend comment</button>
      </SolutionReview>,
    );

    expect(screen.getByRole('button', { name: 'Amend comment' })).toBeInTheDocument();
  });
});
