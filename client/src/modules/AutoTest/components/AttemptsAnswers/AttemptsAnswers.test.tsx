import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskVerificationAttemptDto } from '@client/api';
import AttemptsAnswers from './AttemptsAnswers';

function generateAttempt(overrides: Partial<TaskVerificationAttemptDto> = {}): TaskVerificationAttemptDto {
  return {
    courseTaskId: 1,
    score: 8,
    maxScore: 10,
    createdDate: '2022-10-10T12:00:00.000Z',
    questions: [
      {
        question: 'What is 2 + 2?',
        answers: ['3', '4'],
        multiple: false,
        selectedAnswers: [0],
      },
    ],
    ...overrides,
  } as TaskVerificationAttemptDto;
}

describe('AttemptsAnswers', () => {
  it('should render the heading per attempt counting down from the total', () => {
    render(<AttemptsAnswers attempts={[generateAttempt(), generateAttempt()]} hideAnswers={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Attempt #2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Attempt #1' })).toBeInTheDocument();
  });

  it('should render the score and the formatted date for an attempt', () => {
    render(<AttemptsAnswers attempts={[generateAttempt({ score: 7, maxScore: 10 })]} hideAnswers={vi.fn()} />);

    expect(screen.getByText('Score: 7 / 10')).toBeInTheDocument();
    expect(screen.getByText('2022-10-10 12:00')).toBeInTheDocument();
  });

  it('should render the questions of every attempt', () => {
    render(<AttemptsAnswers attempts={[generateAttempt()]} hideAnswers={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'What is 2 + 2?' })).toBeInTheDocument();
  });

  it('should call hideAnswers when the "Back to table" button is clicked', async () => {
    const user = userEvent.setup();
    const hideAnswers = vi.fn();
    render(<AttemptsAnswers attempts={[generateAttempt()]} hideAnswers={hideAnswers} />);

    await user.click(screen.getByRole('button', { name: /back to table/i }));

    expect(hideAnswers).toHaveBeenCalledTimes(1);
  });
});
