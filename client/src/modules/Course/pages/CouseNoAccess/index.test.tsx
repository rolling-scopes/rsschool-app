import { render, screen } from '@testing-library/react';
import { CouseNoAccessPage } from './';

describe('<CouseNoAccessPage />', () => {
  it('renders the no-access course result', () => {
    render(<CouseNoAccessPage />);
    expect(screen.getByText('You Have No Access to Course Page')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });
});
