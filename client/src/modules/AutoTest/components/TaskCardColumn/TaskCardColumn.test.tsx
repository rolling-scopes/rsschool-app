import { render, screen } from '@testing-library/react';
import TaskCardColumn from './TaskCardColumn';

vi.mock('antd', () => ({
  Space: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Typography: { Text: ({ children }: React.PropsWithChildren) => <span>{children}</span> },
}));

describe('TaskCardColumn', () => {
  it('renders the label and each supported value type', () => {
    const { rerender } = render(<TaskCardColumn label="Max attempts number" value={5} />);

    expect(screen.getByText('Max attempts number')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    rerender(<TaskCardColumn label="Threshold percentage" value={90} />);
    expect(screen.getByText('90')).toBeInTheDocument();

    rerender(<TaskCardColumn label="Strict attempts mode" value={<span>enabled</span>} />);

    expect(screen.getByText('enabled')).toBeInTheDocument();
  });
});
