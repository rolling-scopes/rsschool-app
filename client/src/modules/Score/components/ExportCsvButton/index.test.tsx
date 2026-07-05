import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ExportCsvButton } from './index';

describe('<ExportCsvButton />', () => {
  it('renders nothing when not enabled', () => {
    const { container } = render(<ExportCsvButton enabled={false} onClick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders nothing when "enabled" is omitted (undefined)', () => {
    const { container } = render(<ExportCsvButton onClick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a button when enabled', () => {
    render(<ExportCsvButton enabled onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when the enabled button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ExportCsvButton enabled onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
