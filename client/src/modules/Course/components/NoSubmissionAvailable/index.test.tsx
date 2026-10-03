import { render, screen } from '@testing-library/react';
import { NoSubmissionAvailable } from './';

describe('<NoSubmissionAvailable />', () => {
  it('links to the course schedule when no tasks are available', () => {
    render(<NoSubmissionAvailable courseAlias="rs-2024" />);
    expect(screen.getByRole('heading', { name: /no tasks available for submission now/i })).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /schedule/i });
    expect(link).toHaveAttribute('href', '/course/schedule?course=rs-2024');
  });
});
