import { render, screen } from '@testing-library/react';
import { WelcomeCard } from './WelcomeCard';

describe('WelcomeCard', () => {
  it('renders the welcome content and registration links', () => {
    render(<WelcomeCard />);
    expect(screen.getByText('Welcome to RS School App! Please register to continue')).toBeInTheDocument();
    const img = screen.getByRole('img', { name: 'welcome' });
    expect(img).toHaveAttribute('src', 'https://cdn.rs.school/sloths/stickers/welcome/image.png');
    expect(screen.getByRole('link', { name: /Register as a student/ })).toHaveAttribute('href', '/registry/student');
    expect(screen.getByRole('link', { name: /Register as a mentor/ })).toHaveAttribute('href', '/registry/mentor');
    expect(screen.getByRole('link', { name: /Log in with another GitHub account/ })).toHaveAttribute('href', '/login');
  });
});
