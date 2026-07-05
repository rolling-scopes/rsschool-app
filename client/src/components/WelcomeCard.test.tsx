import { render, screen } from '@testing-library/react';
import { WelcomeCard } from './WelcomeCard';

describe('WelcomeCard', () => {
  it('renders the welcome alert', () => {
    render(<WelcomeCard />);
    expect(screen.getByText('Welcome to RS School App! Please register to continue')).toBeInTheDocument();
  });

  it('renders the welcome sticker image', () => {
    render(<WelcomeCard />);
    const img = screen.getByRole('img', { name: 'welcome' });
    expect(img).toHaveAttribute('src', 'https://cdn.rs.school/sloths/stickers/welcome/image.png');
  });

  it('links to the student and mentor registration pages', () => {
    render(<WelcomeCard />);

    expect(screen.getByRole('link', { name: /Register as a student/ })).toHaveAttribute('href', '/registry/student');
    expect(screen.getByRole('link', { name: /Register as a mentor/ })).toHaveAttribute('href', '/registry/mentor');
  });

  it('links to the login page to switch accounts', () => {
    render(<WelcomeCard />);
    expect(screen.getByRole('link', { name: /Log in with another GitHub account/ })).toHaveAttribute('href', '/login');
  });
});
