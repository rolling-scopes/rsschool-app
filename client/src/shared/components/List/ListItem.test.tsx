import { render, screen } from '@testing-library/react';
import { ListItem } from './ListItem';

vi.mock('antd', () => ({
  Flex: ({
    children,
    align: _align,
    wrap: _wrap,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & { align?: string; wrap?: boolean }) => <div {...props}>{children}</div>,
}));

describe('ListItem', () => {
  it('renders children and forwards class and style props', () => {
    const { rerender } = render(<ListItem>List item content</ListItem>);

    expect(screen.getByText('List item content')).toBeInTheDocument();

    rerender(<ListItem className="custom-class">content</ListItem>);

    expect(screen.getByText('content')).toHaveClass('custom-class');

    rerender(<ListItem style={{ opacity: 0.5 }}>content</ListItem>);

    expect(screen.getByText('content')).toHaveStyle({ opacity: '0.5' });
  });
});
