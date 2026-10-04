import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportCsvButton } from './index';

vi.mock('antd', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Button: ({ children, onClick }: React.ComponentProps<'button'>) => <button onClick={onClick}>{children}</button>,
}));

describe('<ExportCsvButton />', () => {
  it('renders only when enabled and forwards clicks', () => {
    const onClick = vi.fn();
    const { container, rerender } = render(<ExportCsvButton enabled={false} onClick={onClick} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<ExportCsvButton onClick={onClick} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<ExportCsvButton enabled onClick={onClick} />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
