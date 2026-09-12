import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteAllCrossCheckCriteriaButton } from './DeleteAllCrossCheckCriteriaButton';

describe('<DeleteAllCrossCheckCriteriaButton />', () => {
  it('supports cancelling and confirming deletion', async () => {
    const user = userEvent.setup();
    const setDataCriteria = vi.fn();
    render(<DeleteAllCrossCheckCriteriaButton setDataCriteria={setDataCriteria} />);

    const deleteButton = screen.getByRole('button', { name: /delete all/i });
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(await screen.findByText('Are you sure you want to delete all items?')).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /cancel|no/i }));
    expect(setDataCriteria).not.toHaveBeenCalled();

    await user.click(deleteButton);
    await user.click(await screen.findByRole('button', { name: /^ok$|^yes$/i }));
    expect(setDataCriteria).toHaveBeenCalledWith([]);
  });
});
