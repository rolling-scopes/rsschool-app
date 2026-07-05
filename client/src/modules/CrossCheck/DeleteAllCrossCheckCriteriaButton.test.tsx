import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteAllCrossCheckCriteriaButton } from './DeleteAllCrossCheckCriteriaButton';

describe('<DeleteAllCrossCheckCriteriaButton />', () => {
  it('renders the "Delete all" button', () => {
    render(<DeleteAllCrossCheckCriteriaButton setDataCriteria={vi.fn()} />);
    expect(screen.getByRole('button', { name: /delete all/i })).toBeInTheDocument();
  });

  it('asks for confirmation and clears criteria when confirmed', async () => {
    const user = userEvent.setup();
    const setDataCriteria = vi.fn();
    render(<DeleteAllCrossCheckCriteriaButton setDataCriteria={setDataCriteria} />);

    await user.click(screen.getByRole('button', { name: /delete all/i }));

    // Popconfirm asks before clearing.
    expect(await screen.findByText('Are you sure you want to delete all items?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^ok$|^yes$/i }));

    expect(setDataCriteria).toHaveBeenCalledWith([]);
  });

  it('does not clear criteria when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const setDataCriteria = vi.fn();
    render(<DeleteAllCrossCheckCriteriaButton setDataCriteria={setDataCriteria} />);

    await user.click(screen.getByRole('button', { name: /delete all/i }));
    await user.click(await screen.findByRole('button', { name: /cancel|no/i }));

    expect(setDataCriteria).not.toHaveBeenCalled();
  });
});
