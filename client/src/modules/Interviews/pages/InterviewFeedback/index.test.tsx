import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/router';
import { InterviewFeedback } from './index';
import type { FeedbackProps } from '../../data/getInterviewData';

const { showError } = vi.hoisted(() => ({ showError: vi.fn() }));
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { success: vi.fn(), error: showError } }),
}));

// Boundary: CourseService (the only network call this page makes).
const { postStudentInterviewResult } = vi.hoisted(() => ({
  postStudentInterviewResult: vi.fn(),
}));

vi.mock('@client/services/course', () => ({
  CourseService: function CourseService() {
    return { postStudentInterviewResult };
  },
}));

// Replace the large real interview templates with a tiny, deterministic one. This keeps the
// render light (the real shortTrack template has ~50 questions → minutes in jsdom) while still
// exercising both question input branches (Input → TextArea, default → Checkbox).
vi.mock('@client/data/interviews', () => {
  const InputType = { Input: 'input', Checkbox: 'checkbox' } as const;
  return {
    InputType,
    templates: {
      tiny: {
        name: 'Tiny Track',
        examplesUrl: 'https://example.com/questions',
        descriptionHtml: '<p>Intro description</p>',
        categories: [
          {
            id: 1,
            name: 'Category One',
            description: '10 points',
            questions: [
              { id: 101, name: 'Checkbox question' },
              { id: 102, name: 'Text question', type: InputType.Input },
            ],
          },
        ],
      },
      // A minimal template WITHOUT descriptionHtml and with a category that has NO
      // description — exercises the `descriptionHtml ?? ''` and `category.description ? … : null`
      // fallback branches.
      bare: {
        name: 'Bare Track',
        examplesUrl: 'https://example.com/bare',
        categories: [
          {
            id: 2,
            name: 'No Description Category',
            questions: [{ id: 201, name: 'Only checkbox' }],
          },
        ],
      },
    },
  };
});

// GithubAvatar pulls in remote image/network logic.
vi.mock('@client/shared/components/GithubAvatar', () => ({
  GithubAvatar: ({ githubId }: { githubId?: string }) => <div data-testid="avatar">{githubId}</div>,
}));

// PageLayoutSimple may pull heavy deps; passthrough that keeps the title.
vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayoutSimple: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

const back = (useRouter() as unknown as { back: ReturnType<typeof vi.fn> }).back;

function makeProps(overrides: Partial<FeedbackProps> = {}): FeedbackProps {
  return {
    course: { id: 7, alias: 'c7', name: 'Course 7' } as FeedbackProps['course'],
    type: 'tiny' as FeedbackProps['type'],
    interviewTaskId: 555,
    githubId: 'candidate-gh',
    ...overrides,
  };
}

describe('<InterviewFeedback />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not submit when no score is selected (required validation blocks it)', async () => {
    const user = setupUser();
    render(<InterviewFeedback {...makeProps()} />);

    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => {
      expect(screen.getByText('Please select a Score')).toBeInTheDocument();
    });
    expect(postStudentInterviewResult).not.toHaveBeenCalled();
  });

  it('submits the feedback with score, answers and comment, then resets the form', async () => {
    const user = setupUser();
    postStudentInterviewResult.mockResolvedValue({});
    render(<InterviewFeedback {...makeProps()} />);

    // Tick the checkbox question and fill the textarea question.
    await user.click(screen.getByRole('checkbox', { name: /Checkbox question/i }));
    await user.type(screen.getByLabelText('Text question'), 'Answered well');

    // Select a score (ScoreSelector renders clickable cards labelled 1..10).
    await user.click(screen.getByText('8'));

    // Fill the required comment (min length 30).
    await user.click(screen.getByLabelText('Comment'));
    await user.paste('Solid candidate with good fundamentals and clear communication.');

    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => expect(postStudentInterviewResult).toHaveBeenCalledTimes(1));
    const [githubId, interviewTaskId, body] = postStudentInterviewResult.mock.calls[0];
    expect(githubId).toBe('candidate-gh');
    expect(interviewTaskId).toBe(555);
    expect(body.score).toBe(8);
    expect(body.comment).toMatch(/Solid candidate/);
    expect(body.formAnswers).toEqual(
      expect.arrayContaining([
        { questionId: '101', questionText: 'Checkbox question', answer: true },
        { questionId: '102', questionText: 'Text question', answer: 'Answered well' },
      ]),
    );
    await waitFor(() => expect(screen.getByLabelText('Comment')).toHaveValue(''));
  });

  it('does not call the API when there is no githubId', async () => {
    const user = setupUser();
    render(<InterviewFeedback {...makeProps({ githubId: '' })} />);

    await user.click(screen.getByText('8'));
    // Fill the required comment so form validation passes and handleSubmit actually runs;
    // it must then early-return because githubId is empty.
    await user.click(screen.getByLabelText('Comment'));
    await user.paste('A sufficiently long comment to satisfy validation.');
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => {
      // validation passes, but handleSubmit early-returns on empty githubId
      expect(postStudentInterviewResult).not.toHaveBeenCalled();
    });
  });

  it('keeps the form when the submission request fails', async () => {
    const user = setupUser();
    postStudentInterviewResult.mockRejectedValue({
      response: { data: { data: { message: 'Server exploded' } } },
    });
    render(<InterviewFeedback {...makeProps()} />);

    await user.click(screen.getByText('8'));
    // Comment is required (min 30 chars) — fill it so validation passes and submit reaches the API.
    await user.click(screen.getByLabelText('Comment'));
    await user.paste('A sufficiently long comment to satisfy validation.');
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => {
      expect(postStudentInterviewResult).toHaveBeenCalled();
    });
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Server exploded'));
    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment')).toHaveValue('A sufficiently long comment to satisfy validation.');
  });

  it('renders the template links and inputs, then navigates Back', async () => {
    const user = setupUser();
    render(<InterviewFeedback {...makeProps()} />);

    expect(screen.getByRole('heading', { name: /Tiny Track: Interview Feedback/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sample interview questions/i })).toHaveAttribute(
      'href',
      'https://example.com/questions',
    );
    expect(screen.getByRole('link', { name: /candidate-gh/i })).toHaveAttribute(
      'href',
      '/profile?githubId=candidate-gh',
    );

    // Category title (name is wrapped with its description, so match loosely).
    expect(screen.getByText('Category One')).toBeInTheDocument();
    // Checkbox-type question.
    expect(screen.getByRole('checkbox', { name: /Checkbox question/i })).toBeInTheDocument();
    // Input-type question renders a labelled textarea.
    expect(screen.getByLabelText('Text question')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Back$/i }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('renders a template without descriptionHtml and a category without a description', () => {
    render(<InterviewFeedback {...makeProps({ type: 'bare' as FeedbackProps['type'] })} />);

    expect(screen.getByRole('heading', { name: /Bare Track: Interview Feedback/i })).toBeInTheDocument();
    expect(screen.getByText('No Description Category')).toBeInTheDocument();
    // The category has no description → the level-5 sub-title is not rendered (`? … : null`).
    expect(screen.queryByText('10 points')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Only checkbox/i })).toBeInTheDocument();
  });

  it('renders the student avatar without a githubId (nullish coalescing fallback)', () => {
    render(<InterviewFeedback {...makeProps({ githubId: undefined as unknown as string })} />);

    // GithubAvatar receives `githubId ?? undefined` → the mock renders an empty avatar.
    expect(screen.getByTestId('avatar')).toHaveTextContent('');
  });

  it('shows a generic error message when the failure carries no server message', async () => {
    const user = setupUser();
    // Reject with a bare error (no response.data.data.message) → `?? 'An error occurred…'` fallback.
    postStudentInterviewResult.mockRejectedValue(new Error('network down'));
    render(<InterviewFeedback {...makeProps()} />);

    await user.click(screen.getByText('8'));
    await user.click(screen.getByLabelText('Comment'));
    await user.paste('A sufficiently long comment to satisfy validation.');
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => expect(postStudentInterviewResult).toHaveBeenCalled());
    await waitFor(() => expect(showError).toHaveBeenCalledWith('An error occurred. Please try later.'));
    expect(screen.getByLabelText('Comment')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment')).toHaveValue('A sufficiently long comment to satisfy validation.');
  });
});
