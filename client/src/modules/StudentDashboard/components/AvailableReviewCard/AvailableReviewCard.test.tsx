import { render, screen } from '@testing-library/react';
import { AvailableReviewStatsDto } from 'api';
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
  it.each(availableReviews)('should render with available reviews', review => {
    render(<AvailableReviewCard availableReviews={availableReviews} courseAlias={courseAlias} />);
    const link = screen.getByText(review.name);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `./cross-check-review?course=${courseAlias}&taskId=${review.id}`);
    expect(screen.getByText(`${review.completedChecksCount}/${review.checksCount}`)).toBeInTheDocument();
  });

  it('should render 1 divider when 2 review', () => {
    render(<AvailableReviewCard availableReviews={availableReviews} courseAlias={courseAlias} />);
    const dividers = screen.getAllByRole('separator');
    expect(dividers.length).toBe(1);
  });

  it('should not render divider when 1 review', () => {
    render(<AvailableReviewCard availableReviews={[availableReviews[0]]} courseAlias={courseAlias} />);
    const divider = screen.queryByRole('separator');
    expect(divider).not.toBeInTheDocument();
  });

  it('should render "At the moment, there are no tasks available for review." when no available reviews', () => {
    const availableReviews: AvailableReviewStatsDto[] = [];
    render(<AvailableReviewCard availableReviews={availableReviews} courseAlias={courseAlias} />);
    expect(screen.getByText('Cross-check [Review]')).toBeInTheDocument();
    expect(screen.getByText('At the moment, there are no tasks available for review.')).toBeInTheDocument();
  });
});
