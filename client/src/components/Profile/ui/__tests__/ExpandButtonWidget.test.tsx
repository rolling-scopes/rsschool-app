import { render, screen } from '@testing-library/react';
import { ExpandButtonWidget } from '@client/components/Profile/ui';
import userEvent from '@testing-library/user-event';

describe('ExpandButtonWidget', () => {
  it('should render correctly', () => {
    render(<ExpandButtonWidget onClick={() => console.log('test')} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.title).toBe('Open details');
  });

  it('should call onClick callback', async () => {
    const onClick = jest.fn();
    render(<ExpandButtonWidget onClick={onClick} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
