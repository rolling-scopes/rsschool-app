import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { UserSearchDto } from '@client/api';
import { UsersAdminPage } from './UsersAdminPage';

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

// useUsersSearch instantiates UsersApi at module scope.
const { searchUsers } = vi.hoisted(() => ({ searchUsers: vi.fn() }));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  UsersApi: function UsersApi() {
    return { searchUsers };
  },
}));

const results = [
  {
    id: 1,
    githubId: 'octocat',
    name: 'The Octocat',
    cityName: 'Berlin',
    primaryEmail: 'octo@example.com',
    contactsEmail: null,
    contactsEpamEmail: null,
    contactsTelegram: '@octo',
    contactsDiscord: null,
    mentors: [{ courseName: 'RS 2024' }],
    students: [],
  },
] as unknown as UserSearchDto[];

describe('<UsersAdminPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchUsers.mockResolvedValue({ data: results });
  });

  it('renders the search form and no list before searching', () => {
    render(<UsersAdminPage />);

    expect(screen.getByPlaceholderText('Search by github or name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument();
    expect(searchUsers).not.toHaveBeenCalled();
  });

  it('searches and renders the returned users with their populated fields', async () => {
    const user = userEvent.setup();
    render(<UsersAdminPage />);

    await user.type(screen.getByPlaceholderText('Search by github or name'), 'octo');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(searchUsers).toHaveBeenCalledWith('octo'));
    expect(await screen.findByText('octocat')).toBeInTheDocument();
    expect(screen.getByText('The Octocat')).toBeInTheDocument();
    expect(screen.getByText('octo@example.com')).toBeInTheDocument();
    expect(screen.getByText('@octo')).toBeInTheDocument();
    // Mentor field joins course names; empty student list renders nothing.
    expect(screen.getByText('RS 2024')).toBeInTheDocument();
  });

  it('does not call the API when the search box is empty', async () => {
    const user = userEvent.setup();
    render(<UsersAdminPage />);

    await user.click(screen.getByRole('button', { name: /search/i }));

    // searchUsers short-circuits on empty input, so the list never appears.
    await waitFor(() => expect(searchUsers).not.toHaveBeenCalled());
    expect(screen.queryByText('octocat')).not.toBeInTheDocument();
  });

  it('links each result to the user profile page', async () => {
    const user = userEvent.setup();
    render(<UsersAdminPage />);

    await user.type(screen.getByPlaceholderText('Search by github or name'), 'octo');
    await user.click(screen.getByRole('button', { name: /search/i }));

    const link = await screen.findByRole('link', { name: 'octocat' });
    expect(link).toHaveAttribute('href', '/profile?githubId=octocat');
  });
});
