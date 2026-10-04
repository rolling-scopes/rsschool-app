import { fireEvent, render, screen } from '@testing-library/react';
import { ExpandButtonWidget } from '@client/components/Profile/ui';

describe('ExpandButtonWidget', () => {
  it('renders correctly and calls onClick', () => {
    const onClick = vi.fn();
    render(<ExpandButtonWidget onClick={onClick} />);
    const button = screen.getByRole('button');

    expect(button).toBeInTheDocument();
    expect(button.title).toBe('Open details');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
