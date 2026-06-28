import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { message } from 'antd';
import { UserGroupDto } from '@client/api';
import { UserGroupsAdminPage } from './UserGroupsAdminPage';

// --- Boundary mocks --------------------------------------------------------

vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ courses: [] }),
}));

// Stub the remote-search UserSearch (debounced antd Select) with a bound control.
vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: ({ value, onChange }: { value?: number[]; onChange?: (v: number[]) => void }) => {
    const ids = value ?? [];
    return (
      <span>
        <span aria-label="user-search">{ids.join(',')}</span>
        <button type="button" aria-label="add-user-5" onClick={() => onChange?.([...ids, 5])}>
          add 5
        </button>
        <button type="button" aria-label="add-user-6" onClick={() => onChange?.([...ids, 6])}>
          add 6
        </button>
      </span>
    );
  },
}));

// useUserGroups instantiates UserGroupApi at module scope; UserService is a class too.
const { getUserGroups, createUserGroup, updateUserGroup, deleteUserGroup } = vi.hoisted(() => ({
  getUserGroups: vi.fn(),
  createUserGroup: vi.fn(),
  updateUserGroup: vi.fn(),
  deleteUserGroup: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  UserGroupApi: function UserGroupApi() {
    return { getUserGroups, createUserGroup, updateUserGroup, deleteUserGroup };
  },
}));

vi.mock('@client/services/user', () => ({
  UserService: function UserService() {
    return { searchUser: vi.fn().mockResolvedValue([]) };
  },
}));

const groups = [
  {
    id: 1,
    name: 'Admins',
    users: [{ id: 11, githubId: 'gh-a', name: 'Alice' }],
    roles: ['manager'],
  },
] as unknown as UserGroupDto[];

describe('<UserGroupsAdminPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserGroups.mockResolvedValue({ data: groups });
    createUserGroup.mockResolvedValue({});
    updateUserGroup.mockResolvedValue({});
    deleteUserGroup.mockResolvedValue({});
  });

  it('loads and renders user groups on mount', async () => {
    render(<UserGroupsAdminPage />);

    await waitFor(() => expect(getUserGroups).toHaveBeenCalled());
    expect(await screen.findByText('Admins')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /manage user groups/i })).toBeInTheDocument();
  });

  it('creates a group with mapped user ids and a role', async () => {
    const user = userEvent.setup();
    render(<UserGroupsAdminPage />);
    await screen.findByText('Admins');

    await user.click(screen.getByRole('button', { name: /add user group/i }));
    await screen.findByText('User Group');
    const dialog = screen.getByRole('dialog');

    await user.type(within(dialog).getByLabelText('Name'), 'Mentors');
    await user.click(within(dialog).getByLabelText('add-user-5'));
    await user.click(within(dialog).getByLabelText('add-user-6'));
    await user.click(within(dialog).getByLabelText('Roles'));
    await user.click(await screen.findByText('manager', { selector: '.ant-select-item-option-content' }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(createUserGroup).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Mentors', users: [5, 6], roles: ['manager'] }),
      ),
    );
    await waitFor(() => expect(getUserGroups).toHaveBeenCalledTimes(2));
  });

  it('opens the edit modal prefilled and updates by id', async () => {
    const user = userEvent.setup();
    render(<UserGroupsAdminPage />);
    await screen.findByText('Admins');

    const row = screen.getByRole('row', { name: /Admins/ });
    await user.click(within(row).getByText('Edit'));
    await screen.findByText('User Group');
    const dialog = screen.getByRole('dialog');

    const name = within(dialog).getByLabelText('Name');
    expect(name).toHaveValue('Admins');
    await user.clear(name);
    await user.type(name, 'Admins 2');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateUserGroup).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Admins 2' })));
  });

  it('deletes a group after confirming and reloads', async () => {
    const user = userEvent.setup();
    render(<UserGroupsAdminPage />);
    await screen.findByText('Admins');

    const row = screen.getByRole('row', { name: /Admins/ });
    await user.click(within(row).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(deleteUserGroup).toHaveBeenCalledWith(1));
    await waitFor(() => expect(getUserGroups).toHaveBeenCalledTimes(2));
  });

  it('shows an error message when delete fails', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    deleteUserGroup.mockRejectedValueOnce(new Error('boom'));
    render(<UserGroupsAdminPage />);
    await screen.findByText('Admins');

    const row = screen.getByRole('row', { name: /Admins/ });
    await user.click(within(row).getByText('Delete'));
    await user.click(await screen.findByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Failed to delete user group. Please try later.'));
    errorSpy.mockRestore();
  });

  it('shows an error message when save fails', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    updateUserGroup.mockRejectedValueOnce(new Error('boom'));
    render(<UserGroupsAdminPage />);
    await screen.findByText('Admins');

    const row = screen.getByRole('row', { name: /Admins/ });
    await user.click(within(row).getByText('Edit'));
    await screen.findByText('User Group');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('An error occurred. Cannot save user group.'));
    errorSpy.mockRestore();
  });
});
