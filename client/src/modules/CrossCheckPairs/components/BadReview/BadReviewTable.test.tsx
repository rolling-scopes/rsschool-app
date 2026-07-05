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
  it('renders "No data" when there are no rows', () => {
    render(<BadReviewTable data={[]} type="Bad comment" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders the comment column but hides the average score for "Bad comment"', () => {
    render(<BadReviewTable data={rows} type="Bad comment" />);

    // antd Table duplicates header cells in a hidden measure row -> use getAllByText.
    expect(screen.getByRole('columnheader', { name: "Checker's comment" })).toBeInTheDocument();
    expect(screen.getByText('too short')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Average student score' })).not.toBeInTheDocument();
  });

  it('renders the average score column but hides the comment for "Did not check"', () => {
    render(<BadReviewTable data={rows} type="Did not check" />);

    expect(screen.getByRole('columnheader', { name: 'Average student score' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: "Checker's comment" })).not.toBeInTheDocument();
  });

  it('renders the checker and student as github links', () => {
    render(<BadReviewTable data={rows} type="Bad comment" />);

    expect(screen.getByRole('link', { name: /checker-gh/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /student-gh/ })).toBeInTheDocument();
  });
});
