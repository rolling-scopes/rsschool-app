/* eslint-disable testing-library/no-node-access */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CustomPopconfirm } from './CustomPopconfirm';

describe('CustomPopconfirm', () => {
  it('renders, opens, and confirms through the default placement', async () => {
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
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(screen.getByText('Remove item?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /yes|ok/i }));
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(onConfirm).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('honors an explicitly provided placement', async () => {
    vi.useFakeTimers();
    render(
      <CustomPopconfirm title="Confirm" placement="bottomLeft">
        <button>Trigger</button>
      </CustomPopconfirm>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    expect(document.querySelector('.ant-popover-placement-bottomLeft')).not.toBeNull();
    vi.useRealTimers();
  });
});
