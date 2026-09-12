/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { act, render, screen } from '@testing-library/react';
import { TooltipedButton } from './TooltipedButton';

describe('TooltipedButton', () => {
  const baseProps = {
    tooltipTitle: 'Helpful hint',
    buttonText: 'Confirm',
    open: false,
    loading: false,
    disabled: false,
  };

  it('renders its enabled, disabled, loading, and open-tooltip states', () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<TooltipedButton {...baseProps} />);

    const button = screen.getByRole('button', { name: /confirm/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    rerender(<TooltipedButton {...baseProps} disabled />);
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();

    rerender(<TooltipedButton {...baseProps} loading />);
    expect(container.querySelector('.ant-btn-loading')).toBeInTheDocument();

    rerender(<TooltipedButton {...baseProps} open />);
    act(() => vi.runOnlyPendingTimers());
    expect(screen.getByText('Helpful hint')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
