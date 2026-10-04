import { render, screen } from '@testing-library/react';
import { DateWidget } from '@client/components/Profile/ui';

vi.mock('@ant-design/icons/CalendarOutlined', () => ({
  default: () => <span role="img" aria-label="calendar" />,
}));
vi.mock('antd', () => ({
  Flex: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Space: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  theme: { useToken: () => ({ token: { colorTextTertiary: '#000' } }) },
  Typography: { Text: ({ children, ...props }: React.PropsWithChildren) => <span {...props}>{children}</span> },
}));

describe('DateWidget', () => {
  it('renders nothing without a date and formatted content otherwise', () => {
    const { rerender } = render(<DateWidget />);
    const element = screen.queryByTestId('date-widget');
    expect(element).not.toBeInTheDocument();

    rerender(<DateWidget date="2025-01-15T12:34:56Z" />);
    expect(screen.getByTestId('date-widget')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('2025-01-15')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /calendar/i })).toBeInTheDocument();
  });
});
