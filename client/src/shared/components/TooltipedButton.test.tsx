/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipedButton } from './TooltipedButton';

describe('TooltipedButton', () => {
  const baseProps = {
    tooltipTitle: 'Helpful hint',
    buttonText: 'Confirm',
    open: false,
    loading: false,
    disabled: false,
  };

  it('renders the button with its text', () => {
    render(<TooltipedButton {...baseProps} />);

    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('shows the tooltip text when open is true', async () => {
    render(<TooltipedButton {...baseProps} open />);

    expect(await screen.findByText('Helpful hint')).toBeInTheDocument();
  });

  it('disables the button when disabled is true', () => {
    render(<TooltipedButton {...baseProps} disabled />);

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });

  it('shows a loading indicator when loading is true', () => {
    const { container } = render(<TooltipedButton {...baseProps} loading />);

    expect(container.querySelector('.ant-btn-loading')).toBeInTheDocument();
  });

  it('renders an enabled button that can be focused/clicked when not disabled', async () => {
    const user = userEvent.setup();
    render(<TooltipedButton {...baseProps} />);

    const button = screen.getByRole('button', { name: /confirm/i });
    await user.click(button);

    expect(button).toBeEnabled();
  });
});
