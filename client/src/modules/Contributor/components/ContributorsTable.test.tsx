import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContributorDto } from '@client/api';
import { ContributorsTable } from './ContributorsTable';

const data = [
  { id: 1, description: 'First', user: { githubId: 'gh-one' } },
  { id: 2, description: 'Second', user: { githubId: 'gh-two' } },
] as unknown as ContributorDto[];

function getContributorRow(githubId: string) {
  // eslint-disable-next-line testing-library/no-node-access -- Avoid computing accessible names for every table row.
  const row = screen.getByText(githubId).closest('tr');
  expect(row).toHaveRole('row');
  return row!;
}

describe('<ContributorsTable />', () => {
  it('renders contributor details and calls handleUpdate for the selected row', async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();
    render(
      <ContributorsTable data={data} handleUpdate={handleUpdate} handleDelete={vi.fn().mockResolvedValue(undefined)} />,
    );

    expect(screen.getByText('gh-one')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('gh-two')).toBeInTheDocument();

    const row = getContributorRow('gh-one');
    const [editBtn] = within(row).getAllByRole('button');
    await user.click(editBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('calls handleDelete with the row record when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(<ContributorsTable data={data} handleUpdate={vi.fn()} handleDelete={handleDelete} />);

    const row = getContributorRow('gh-two');
    const buttons = within(row).getAllByRole('button');
    await user.click(buttons[1]);

    expect(handleDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });
});
