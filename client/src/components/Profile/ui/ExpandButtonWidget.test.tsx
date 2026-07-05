import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpandButtonWidget } from './ExpandButtonWidget';

describe('ExpandButtonWidget', () => {
  it('renders an accessible expand button', () => {
    render(<ExpandButtonWidget onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Open details' })).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ExpandButtonWidget onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Open details' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
