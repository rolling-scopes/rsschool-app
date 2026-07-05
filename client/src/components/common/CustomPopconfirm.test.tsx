/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomPopconfirm } from './CustomPopconfirm';

describe('CustomPopconfirm', () => {
  it('renders its trigger children', () => {
    render(
      <CustomPopconfirm title="Are you sure?">
        <button>Delete</button>
      </CustomPopconfirm>,
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('opens the confirmation popup on click and fires onConfirm', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <CustomPopconfirm title="Remove item?" onConfirm={onConfirm}>
        <button>Delete</button>
      </CustomPopconfirm>,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Remove item?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /yes|ok/i }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
  });

  it('honors an explicitly provided placement', async () => {
    const user = userEvent.setup();
    render(
      <CustomPopconfirm title="Confirm" placement="bottomLeft">
        <button>Trigger</button>
      </CustomPopconfirm>,
    );

    await user.click(screen.getByRole('button', { name: 'Trigger' }));

    // popup renders with the placement reflected in the overlay class
    await waitFor(() => {
      expect(document.querySelector('.ant-popover-placement-bottomLeft')).not.toBeNull();
    });
  });
});
