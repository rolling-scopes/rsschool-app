import { render, screen, within } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { PromptDto } from '@client/api';
import { PromptTable } from './PromptTable';

const data = [
  { id: 1, type: 'summary', temperature: 0.5, text: 'A' },
  { id: 2, type: 'gratitude', temperature: 0.7, text: 'B' },
] as unknown as PromptDto[];

function getPromptRow(type: string) {
  // eslint-disable-next-line testing-library/no-node-access -- Avoid computing accessible names for every table row.
  const row = screen.getByText(type).closest('tr');
  expect(row).toHaveRole('row');
  return row!;
}

describe('<PromptTable />', () => {
  it('renders prompt rows and calls handleUpdate for the selected record', async () => {
    const user = setupUser();
    const handleUpdate = vi.fn();
    render(<PromptTable data={data} handleUpdate={handleUpdate} handleDelete={vi.fn().mockResolvedValue(undefined)} />);

    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.getByText('gratitude')).toBeInTheDocument();

    const row = getPromptRow('summary');
    const [editBtn] = within(row).getAllByRole('button');
    await user.click(editBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ type: 'summary' }));
  });

  it('calls handleDelete with the row record when the delete button is clicked', async () => {
    const user = setupUser();
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(<PromptTable data={data} handleUpdate={vi.fn()} handleDelete={handleDelete} />);

    const row = getPromptRow('gratitude');
    const buttons = within(row).getAllByRole('button');
    await user.click(buttons[1]);

    expect(handleDelete).toHaveBeenCalledWith(expect.objectContaining({ type: 'gratitude' }));
  });
});
