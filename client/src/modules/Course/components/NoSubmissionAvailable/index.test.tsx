import { render, screen } from '@testing-library/react';
import { NoSubmissionAvailable } from './';

describe('<NoSubmissionAvailable />', () => {
  it('tells the user no tasks are available', () => {
    render(<NoSubmissionAvailable courseAlias="rs-2024" />);
    expect(screen.getByRole('heading', { name: /no tasks available for submission now/i })).toBeInTheDocument();
  });

  it('links to the schedule for the given course alias', () => {
    render(<NoSubmissionAvailable courseAlias="rs-2024" />);
    const link = screen.getByRole('link', { name: /schedule/i });
    expect(link).toHaveAttribute('href', '/course/schedule?course=rs-2024');
  });
});
