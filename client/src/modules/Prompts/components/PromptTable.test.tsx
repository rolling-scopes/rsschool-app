import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptDto } from '@client/api';
import { PromptTable } from './PromptTable';

const data = [
  { id: 1, type: 'summary', temperature: 0.5, text: 'A' },
  { id: 2, type: 'gratitude', temperature: 0.7, text: 'B' },
] as unknown as PromptDto[];

describe('<PromptTable />', () => {
  it('renders a row per prompt with its type', () => {
    render(<PromptTable data={data} handleUpdate={vi.fn()} handleDelete={vi.fn().mockResolvedValue(undefined)} />);

    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.getByText('gratitude')).toBeInTheDocument();
  });

  it('calls handleUpdate with the row record when the edit button is clicked', async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();
    render(<PromptTable data={data} handleUpdate={handleUpdate} handleDelete={vi.fn().mockResolvedValue(undefined)} />);

    const row = screen.getByRole('row', { name: /summary/ });
    const [editBtn] = within(row).getAllByRole('button');
    await user.click(editBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ type: 'summary' }));
  });

  it('calls handleDelete with the row record when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(<PromptTable data={data} handleUpdate={vi.fn()} handleDelete={handleDelete} />);

    const row = screen.getByRole('row', { name: /gratitude/ });
    const buttons = within(row).getAllByRole('button');
    await user.click(buttons[1]);

    expect(handleDelete).toHaveBeenCalledWith(expect.objectContaining({ type: 'gratitude' }));
  });
});
