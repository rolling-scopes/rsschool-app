import { render, screen } from '@testing-library/react';
import { formatDate } from '@client/services/formatter';
import { DateWidget } from './DateWidget';

describe('DateWidget', () => {
  it('renders the formatted date with a label', () => {
    render(<DateWidget date="2024-01-15T10:00:00.000Z" />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByTestId('date-widget')).toHaveTextContent(formatDate('2024-01-15T10:00:00.000Z'));
  });

  it('renders nothing when date is missing', () => {
    const { container } = render(<DateWidget />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when date is an empty string', () => {
    const { container } = render(<DateWidget date="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
