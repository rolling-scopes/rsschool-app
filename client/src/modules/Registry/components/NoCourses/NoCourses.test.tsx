import { render, screen } from '@testing-library/react';
import { NoCourses } from './NoCourses';

describe('NoCourses', () => {
  test('renders the empty-state title and subtitle', () => {
    render(<NoCourses />);

    expect(screen.getByText('There are no available courses.')).toBeInTheDocument();
    expect(screen.getByText('Please come back later.')).toBeInTheDocument();
  });

  test('renders a Back to Home link pointing at the root', () => {
    render(<NoCourses />);

    const link = screen.getByRole('link', { name: 'Back to Home' });
    expect(link).toHaveAttribute('href', '/');
  });
});
