import { render, screen } from '@testing-library/react';
import { formatDate } from '@client/services/formatter';
import { DateWidget } from './DateWidget';

vi.mock('antd', () => ({
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  theme: { useToken: () => ({ token: { colorTextTertiary: '#777' } }) },
  Typography: { Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span> },
}));

describe('DateWidget', () => {
  it('renders a formatted date and nothing for missing or empty dates', () => {
    const { container, rerender } = render(<DateWidget date="2024-01-15T10:00:00.000Z" />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByTestId('date-widget')).toHaveTextContent(formatDate('2024-01-15T10:00:00.000Z'));

    rerender(<DateWidget />);
    expect(container).toBeEmptyDOMElement();

    rerender(<DateWidget date="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
