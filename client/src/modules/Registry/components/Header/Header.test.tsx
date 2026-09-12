import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  test('renders string and ReactNode titles with the static subtitle', () => {
    const { rerender } = render(<Header title="Mentors registration" />);

    expect(screen.getByRole('heading', { name: 'Mentors registration' })).toBeInTheDocument();
    expect(screen.getByText('Free courses from the developer community')).toBeInTheDocument();

    rerender(<Header title={<span>Welcome to RS School</span>} />);

    expect(screen.getByText('Welcome to RS School')).toBeInTheDocument();
  });
});
