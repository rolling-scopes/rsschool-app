import { render, screen } from '@testing-library/react';
import { DateWidget } from '@client/components/Profile/ui';

describe('DateWidget', () => {
  it('returns null when no date provided', () => {
    render(<DateWidget />);
    const element = screen.queryByTestId('date-widget');
    expect(element).not.toBeInTheDocument();
  });

  it('renders formatted date and label when date provided', () => {
    render(<DateWidget date={'2025-01-15T12:34:56Z'} />);
    expect(screen.getByTestId('date-widget')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('2025-01-15')).toBeInTheDocument();
  });

  it('renders calendar icon', () => {
    render(<DateWidget date={'2025-01-15T12:34:56Z'} />);
    expect(screen.getByTestId('date-widget')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /calendar/i })).toBeInTheDocument();
  });
});
