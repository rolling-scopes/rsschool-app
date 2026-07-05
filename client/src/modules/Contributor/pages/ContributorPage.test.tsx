import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { ContributorPage } from './ContributorPage';

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

vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: ({ value, onChange }: { value?: number; onChange?: (v: number) => void }) => (
    <input aria-label="user-search" value={value ?? ''} onChange={e => onChange?.(Number(e.target.value))} />
  ),
}));

const { getContributors, deleteContributor, getContributor, createContributor, searchUsers } = vi.hoisted(() => ({
  getContributors: vi.fn(),
  deleteContributor: vi.fn(),
  getContributor: vi.fn(),
  createContributor: vi.fn(),
  searchUsers: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  ContributorsApi: function ContributorsApi() {
    return { getContributors, deleteContributor, getContributor, createContributor };
  },
  UsersApi: function UsersApi() {
    return { searchUsers };
  },
}));

const contributors = [
  { id: 1, description: 'First', user: { githubId: 'gh-one' } },
  { id: 2, description: 'Second', user: { githubId: 'gh-two' } },
];

describe('<ContributorPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getContributors.mockResolvedValue({ data: contributors });
    deleteContributor.mockResolvedValue({});
    createContributor.mockResolvedValue({});
    searchUsers.mockResolvedValue({ data: [] });
    getContributor.mockResolvedValue({ data: {} });
  });

  it('loads and renders contributors on mount', async () => {
    render(<ContributorPage />);

    await waitFor(() => expect(getContributors).toHaveBeenCalled());
    expect(await screen.findByText('gh-one')).toBeInTheDocument();
    expect(screen.getByText('gh-two')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /manage contributors/i })).toBeInTheDocument();
  });

  it('opens the create modal when "Add Contributor" is clicked', async () => {
    const user = userEvent.setup();
    render(<ContributorPage />);
    await screen.findByText('gh-one');

    await user.click(screen.getByRole('button', { name: /add contributor/i }));

    // "Add Contributor" is both the trigger button and the modal title; assert the
    // modal one by scoping to the dialog.
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Add Contributor')).toBeInTheDocument();
  });

  it('opens the edit modal when a row edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ContributorPage />);
    await screen.findByText('gh-one');

    const row = screen.getByRole('row', { name: /gh-one/ });
    const [editBtn] = within(row).getAllByRole('button');
    await user.click(editBtn);

    expect(await screen.findByText('Edit Contributor')).toBeInTheDocument();
    await waitFor(() => expect(getContributor).toHaveBeenCalledWith(1));
  });

  it('deletes a contributor and reloads the list', async () => {
    const user = userEvent.setup();
    render(<ContributorPage />);
    await screen.findByText('gh-two');

    const row = screen.getByRole('row', { name: /gh-two/ });
    const buttons = within(row).getAllByRole('button');
    await user.click(buttons[1]);

    await waitFor(() => expect(deleteContributor).toHaveBeenCalledWith(2));
    await waitFor(() => expect(getContributors).toHaveBeenCalledTimes(2));
  });

  it('reloads the list after the modal closes', async () => {
    const user = userEvent.setup();
    render(<ContributorPage />);
    await screen.findByText('gh-one');

    await user.click(screen.getByRole('button', { name: /add contributor/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(getContributors).toHaveBeenCalledTimes(2));
  });
});
