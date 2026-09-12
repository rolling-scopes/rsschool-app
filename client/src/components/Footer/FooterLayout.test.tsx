import { render, screen } from '@testing-library/react';
import { FooterLayout } from './FooterLayout';

describe('FooterLayout', () => {
  afterEach(() => vi.useRealTimers());

  it('renders its sections, social networks, and current-year copyright', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-05-10T00:00:00Z'));

    render(<FooterLayout />);
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Thank you for your support!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub/ })).toBeInTheDocument();
    expect(screen.getByText(/The Rolling Scopes 2031/)).toBeInTheDocument();
  });
});
