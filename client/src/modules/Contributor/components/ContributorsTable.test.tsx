import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContributorDto } from '@client/api';
import { ContributorsTable } from './ContributorsTable';

const data = [
  { id: 1, description: 'First', user: { githubId: 'gh-one' } },
  { id: 2, description: 'Second', user: { githubId: 'gh-two' } },
] as unknown as ContributorDto[];

describe('<ContributorsTable />', () => {
  it('renders a row per contributor with github id and description', () => {
    render(
      <ContributorsTable data={data} handleUpdate={vi.fn()} handleDelete={vi.fn().mockResolvedValue(undefined)} />,
    );

    expect(screen.getByText('gh-one')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('gh-two')).toBeInTheDocument();
  });

  it('calls handleUpdate with the row record when the edit button is clicked', async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();
    render(
      <ContributorsTable data={data} handleUpdate={handleUpdate} handleDelete={vi.fn().mockResolvedValue(undefined)} />,
    );

    const row = screen.getByRole('row', { name: /gh-one/ });
    const [editBtn] = within(row).getAllByRole('button');
    await user.click(editBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('calls handleDelete with the row record when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(<ContributorsTable data={data} handleUpdate={vi.fn()} handleDelete={handleDelete} />);

    const row = screen.getByRole('row', { name: /gh-two/ });
    const buttons = within(row).getAllByRole('button');
    await user.click(buttons[1]);

    expect(handleDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });
});
