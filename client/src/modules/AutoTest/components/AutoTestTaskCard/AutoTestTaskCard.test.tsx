import { render, screen } from '@testing-library/react';
import { BasicAutoTestTaskDto } from '@client/api';
import AutoTestTaskCard from './AutoTestTaskCard';

function renderCard(courseTask: Partial<BasicAutoTestTaskDto> = {}) {
  return render(
    <AutoTestTaskCard
      courseTask={
        {
          id: 42,
          name: 'Self Education Task',
          maxAttemptsNumber: 3,
          numberOfQuestions: 10,
          strictAttemptsMode: 1,
          thresholdPercentage: 80,
          ...courseTask,
        } as BasicAutoTestTaskDto
      }
    />,
  );
}

describe('AutoTestTaskCard', () => {
  it('renders task details, value fallbacks, switch states, and preview link', () => {
    const { rerender } = renderCard();

    expect(screen.getByText(/Self Education Task/)).toBeInTheDocument();
    expect(screen.getByText('Max attempts number')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Number of Questions')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Threshold percentage')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();

    rerender(
      <AutoTestTaskCard
        courseTask={
          {
            id: 99,
            name: 'Self Education Task',
            maxAttemptsNumber: null,
            numberOfQuestions: null,
            strictAttemptsMode: null,
            thresholdPercentage: null,
          } as BasicAutoTestTaskDto
        }
      />,
    );
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getAllByText('–')).toHaveLength(3);
    const link = screen.getByRole('link', { name: /preview task/i });
    expect(link).toHaveAttribute('href', '/admin/auto-test-task/99');
  });
});
