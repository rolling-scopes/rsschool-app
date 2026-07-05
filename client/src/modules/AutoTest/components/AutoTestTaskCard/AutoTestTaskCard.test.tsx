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
  it('should render the task name', () => {
    renderCard();

    expect(screen.getByText(/Self Education Task/)).toBeInTheDocument();
  });

  it('should render the column labels and their values', () => {
    renderCard();

    expect(screen.getByText('Max attempts number')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Number of Questions')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Threshold percentage')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('should render a checked switch when strict attempts mode is enabled', () => {
    renderCard({ strictAttemptsMode: 1 });

    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('should render an unchecked switch when strict attempts mode is disabled', () => {
    renderCard({ strictAttemptsMode: null });

    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('should render a dash placeholder when numeric values are missing', () => {
    renderCard({ maxAttemptsNumber: null, numberOfQuestions: null, thresholdPercentage: null });

    expect(screen.getAllByText('–')).toHaveLength(3);
  });

  it('should link the preview button to the admin task page', () => {
    renderCard({ id: 99 });

    const link = screen.getByRole('link', { name: /preview task/i });
    expect(link).toHaveAttribute('href', '/admin/auto-test-task/99');
  });
});
