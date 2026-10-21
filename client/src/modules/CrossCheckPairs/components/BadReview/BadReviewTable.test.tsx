import { render, screen } from '@testing-library/react';
import { IBadReview } from './BadReviewControllers';
import { BadReviewTable } from './BadReviewTable';

const rows: IBadReview[] = [
  {
    checkerScore: 5,
    comment: 'too short',
    taskName: 'Task 1',
    checkerGithubId: 'checker-gh',
    studentGithubId: 'student-gh',
    studentAvgScore: 7,
  },
];

describe('<BadReviewTable />', () => {
  it('renders empty, bad-comment, and did-not-check views', () => {
    const { rerender } = render(<BadReviewTable data={[]} type="Bad comment" />);

    expect(screen.getByText('No data')).toBeInTheDocument();

    rerender(<BadReviewTable data={rows} type="Bad comment" />);

    expect(screen.getByRole('columnheader', { name: "Checker's comment" })).toBeInTheDocument();
    expect(screen.getByText('too short')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Average student score' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /checker-gh/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /student-gh/ })).toBeInTheDocument();

    rerender(<BadReviewTable data={rows} type="Did not check" />);

    expect(screen.getByRole('columnheader', { name: 'Average student score' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: "Checker's comment" })).not.toBeInTheDocument();
  });
});
