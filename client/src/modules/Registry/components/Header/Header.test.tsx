import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  test('renders the provided title as a heading', () => {
    render(<Header title="Mentors registration" />);

    expect(screen.getByRole('heading', { name: 'Mentors registration' })).toBeInTheDocument();
  });

  test('renders a ReactNode title', () => {
    render(<Header title={<span>Welcome to RS School</span>} />);

    expect(screen.getByText('Welcome to RS School')).toBeInTheDocument();
  });

  test('renders the static subtitle', () => {
    render(<Header title="any" />);

    expect(screen.getByText('Free courses from the developer community')).toBeInTheDocument();
  });
});
