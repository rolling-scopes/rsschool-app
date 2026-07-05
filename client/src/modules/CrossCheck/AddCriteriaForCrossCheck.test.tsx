/* eslint-disable testing-library/no-node-access */
// Complements `__tests__/AddCriteriaForCrossCheck.test.tsx` (basic render + save)
// by covering the per-type payload branches and the canSave validation paths.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddCriteriaForCrossCheck } from './AddCriteriaForCrossCheck';

async function selectType(user: ReturnType<typeof userEvent.setup>, optionName: string) {
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByText(optionName, { selector: '.ant-select-item-option-content' }));
}

describe('<AddCriteriaForCrossCheck /> payload branches', () => {
  it('keeps the save button disabled until a title text is entered, then clears on save', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<AddCriteriaForCrossCheck onCreate={onCreate} />);

    const addButton = screen.getByRole('button', { name: 'Add New Criteria' });
    expect(addButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText('Add description');
    await user.type(textarea, 'My title');
    expect(addButton).toBeEnabled();

    await user.click(addButton);

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'title', text: 'My title', key: '0', index: 0 }),
    );
    expect(textarea).toHaveValue('');
  });

  it('requires a non-zero max score for a subtask and emits it in the payload', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<AddCriteriaForCrossCheck onCreate={onCreate} />);

    await selectType(user, 'Subtask');
    expect(screen.getByText('Add Max Score')).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: 'Add New Criteria' });
    await user.type(screen.getByPlaceholderText('Add description'), 'Subtask text');
    expect(addButton).toBeDisabled();

    const maxScoreInput = within(screen.getByText('Add Max Score').closest('.ant-form-item') as HTMLElement).getByRole(
      'spinbutton',
    );
    await user.clear(maxScoreInput);
    await user.type(maxScoreInput, '5');

    expect(addButton).toBeEnabled();
    await user.click(addButton);

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'subtask', text: 'Subtask text', max: 5 }));
  });

  it('stores a penalty max score as a negative value', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<AddCriteriaForCrossCheck onCreate={onCreate} />);

    await selectType(user, 'Penalty');
    expect(screen.getByText('Add Max Penalty')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Add description'), 'Penalty text');
    const penaltyInput = within(screen.getByText('Add Max Penalty').closest('.ant-form-item') as HTMLElement).getByRole(
      'spinbutton',
    );
    await user.clear(penaltyInput);
    await user.type(penaltyInput, '4');

    await user.click(screen.getByRole('button', { name: 'Add New Criteria' }));

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'penalty', text: 'Penalty text', max: -4 }));
  });
});
