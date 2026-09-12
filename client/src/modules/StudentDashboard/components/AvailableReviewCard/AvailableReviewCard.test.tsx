import { render, screen } from '@testing-library/react';
import { AvailableReviewStatsDto } from '@client/api';
import { AvailableReviewCard } from './AvailableReviewCard';

const availableReviews: AvailableReviewStatsDto[] = [
  {
    id: 1,
    name: 'Task 1',
    completedChecksCount: 2,
    checksCount: 5,
  },
  {
    id: 2,
    name: 'Task 2',
    completedChecksCount: 3,
    checksCount: 8,
  },
];
const courseAlias = 'course1';

describe('AvailableReviewCard', () => {
  it('renders multiple, single, and empty review states', () => {
    const { rerender } = render(<AvailableReviewCard availableReviews={availableReviews} courseAlias={courseAlias} />);
    availableReviews.forEach(review => {
      const link = screen.getByText(review.name);
      expect(link).toHaveAttribute('href', `./cross-check-review?course=${courseAlias}&taskId=${review.id}`);
      expect(screen.getByText(`${review.completedChecksCount}/${review.checksCount}`)).toBeInTheDocument();
    });
    expect(screen.getAllByRole('separator')).toHaveLength(1);

    rerender(<AvailableReviewCard availableReviews={availableReviews.slice(0, 1)} courseAlias={courseAlias} />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();

    rerender(<AvailableReviewCard availableReviews={[]} courseAlias={courseAlias} />);
    expect(screen.getByText('Cross-check [Review]')).toBeInTheDocument();
    expect(screen.getByText('At the moment, there are no tasks available for review')).toBeInTheDocument();
  });
});
