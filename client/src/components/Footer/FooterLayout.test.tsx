import { render, screen } from '@testing-library/react';
import { FooterLayout } from './FooterLayout';

describe('FooterLayout', () => {
  it('renders the Help, Feedback and Donation sections', () => {
    render(<FooterLayout />);

    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Thank you for your support!')).toBeInTheDocument();
  });

  it('renders the social networks', () => {
    render(<FooterLayout />);
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeInTheDocument();
  });

  it('renders the copyright with the current year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-05-10T00:00:00Z'));

    render(<FooterLayout />);

    expect(screen.getByText(/The Rolling Scopes 2031/)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
