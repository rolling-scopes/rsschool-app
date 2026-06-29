import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { ContributorModal } from './ContributorModal';

// --- Boundary mocks --------------------------------------------------------
// ContributorsApi (fetch + create/update) and UsersApi (search) are instantiated
// at module scope. ahooks `useRequest` (real) drives the initial fetch.
const { getContributor, createContributor, updateContributor, searchUsers } = vi.hoisted(() => ({
  getContributor: vi.fn(),
  createContributor: vi.fn(),
  updateContributor: vi.fn(),
  searchUsers: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  ContributorsApi: function ContributorsApi() {
    return { getContributor, createContributor, updateContributor };
  },
  UsersApi: function UsersApi() {
    return { searchUsers };
  },
}));

// Stub remote-search UserSearch with a control bound to the form field (user.id).
vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: ({ value, onChange }: { value?: number; onChange?: (v: number) => void }) => (
    <input aria-label="user-search" value={value ?? ''} onChange={e => onChange?.(Number(e.target.value))} />
  ),
}));

describe('<ContributorModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchUsers.mockResolvedValue({ data: [] });
    createContributor.mockResolvedValue({});
    updateContributor.mockResolvedValue({});
    getContributor.mockResolvedValue({
      data: {
        id: 7,
        description: 'Existing description',
        user: { id: 3, githubId: 'gh3', firstName: 'Joe', lastName: 'Doe' },
      },
    });
  });

  it('renders the "Add Contributor" title and empty fields when creating', async () => {
    render(<ContributorModal contributorId={null} onClose={vi.fn()} />);

    expect(await screen.findByText('Add Contributor')).toBeInTheDocument();
    // No fetch when there is no id.
    expect(getContributor).not.toHaveBeenCalled();
    expect(await screen.findByLabelText('Description')).toHaveValue('');
  });

  it('fetches and prefills the form when editing', async () => {
    render(<ContributorModal contributorId={7} onClose={vi.fn()} />);

    expect(await screen.findByText('Edit Contributor')).toBeInTheDocument();
    await waitFor(() => expect(getContributor).toHaveBeenCalledWith(7));
    await waitFor(() => expect(screen.getByLabelText('Description')).toHaveValue('Existing description'));
  });

  it('creates a contributor from the typed values', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ContributorModal contributorId={null} onClose={onClose} />);

    await screen.findByText('Add Contributor');
    await user.type(screen.getByLabelText('user-search'), '42');
    await user.type(screen.getByLabelText('Description'), 'A great contributor');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(createContributor).toHaveBeenCalledWith({ description: 'A great contributor', userId: 42 }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('updates the existing contributor by id when editing', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ContributorModal contributorId={7} onClose={onClose} />);

    await waitFor(() => expect(screen.getByLabelText('Description')).toHaveValue('Existing description'));
    const desc = screen.getByLabelText('Description');
    await user.clear(desc);
    await user.type(desc, 'Updated description');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(updateContributor).toHaveBeenCalledWith(7, { description: 'Updated description', userId: 3 }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows an error and stays open when validation fails (no user)', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    const onClose = vi.fn();
    render(<ContributorModal contributorId={null} onClose={onClose} />);

    await screen.findByText('Add Contributor');
    await user.type(screen.getByLabelText('Description'), 'No user chosen');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again later.'));
    expect(createContributor).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ContributorModal contributorId={null} onClose={onClose} />);

    await screen.findByText('Add Contributor');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
