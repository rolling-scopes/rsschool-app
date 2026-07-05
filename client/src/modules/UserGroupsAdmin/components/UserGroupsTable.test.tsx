import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserGroupDto } from '@client/api';
import { UserGroupsTable } from './UserGroupsTable';

const data = [
  {
    id: 1,
    name: 'Admins',
    users: [
      { id: 11, githubId: 'gh-a', name: 'Alice' },
      { id: 12, githubId: 'gh-b', name: 'Bob' },
    ],
    roles: ['manager', 'supervisor'],
  },
  {
    id: 2,
    name: 'Mentors',
    users: [{ id: 13, githubId: 'gh-c', name: 'Carol' }],
    roles: ['dementor'],
  },
] as unknown as UserGroupDto[];

describe('<UserGroupsTable />', () => {
  it('renders group names, users and role tags', () => {
    render(<UserGroupsTable data={data} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Admins')).toBeInTheDocument();
    expect(screen.getByText('Mentors')).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
    expect(screen.getByText('supervisor')).toBeInTheDocument();
    expect(screen.getByText('dementor')).toBeInTheDocument();
  });

  it('calls onEdit with the row record when Edit is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<UserGroupsTable data={data} onEdit={onEdit} onDelete={vi.fn()} />);

    const row = screen.getByRole('row', { name: /Admins/ });
    await user.click(within(row).getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });

  it('calls onDelete with the id after confirming', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<UserGroupsTable data={data} onEdit={vi.fn()} onDelete={onDelete} />);

    const row = screen.getByRole('row', { name: /Mentors/ });
    await user.click(within(row).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(2));
  });
});
