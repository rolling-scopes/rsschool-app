import { fireEvent, render, screen } from '@testing-library/react';
import { ExpandButtonWidget } from './ExpandButtonWidget';

describe('ExpandButtonWidget', () => {
  it('renders an accessible button and calls onClick when pressed', () => {
    const onClick = vi.fn();
    render(<ExpandButtonWidget onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Open details' });

    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
