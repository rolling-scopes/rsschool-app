import { fireEvent, render, screen } from '@testing-library/react';
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
  it('renders every attempt and returns to the table', () => {
    const hideAnswers = vi.fn();
    render(<AttemptsAnswers attempts={[generateAttempt({ score: 7 }), generateAttempt()]} hideAnswers={hideAnswers} />);

    expect(screen.getByRole('heading', { name: 'Attempt #2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Attempt #1' })).toBeInTheDocument();
    expect(screen.getByText('Score: 7 / 10')).toBeInTheDocument();
    expect(screen.getAllByText('2022-10-10 12:00')).toHaveLength(2);
    expect(screen.getAllByRole('heading', { name: 'What is 2 + 2?' })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /back to table/i }));
    expect(hideAnswers).toHaveBeenCalledTimes(1);
  });
});
