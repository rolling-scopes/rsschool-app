/* eslint-disable testing-library/no-node-access */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CustomPopconfirm } from './CustomPopconfirm';

describe('CustomPopconfirm', () => {
  it('renders, opens, and confirms through the default placement', () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(
      <CustomPopconfirm title="Remove item?" onConfirm={onConfirm}>
        <button>Delete</button>
      </CustomPopconfirm>,
    );

    const trigger = screen.getByRole('button', { name: 'Delete' });
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger);
    act(() => vi.runOnlyPendingTimers());
    expect(screen.getByText('Remove item?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /yes|ok/i }));
    act(() => vi.runOnlyPendingTimers());
    expect(onConfirm).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('honors an explicitly provided placement', () => {
    vi.useFakeTimers();
    render(
      <CustomPopconfirm title="Confirm" placement="bottomLeft">
        <button>Trigger</button>
      </CustomPopconfirm>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    act(() => vi.runOnlyPendingTimers());
    expect(document.querySelector('.ant-popover-placement-bottomLeft')).not.toBeNull();
    vi.useRealTimers();
  });
});
