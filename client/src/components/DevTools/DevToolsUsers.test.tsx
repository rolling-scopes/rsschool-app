import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import DevToolsUsers from './DevToolsUsers';

const { getDevUsers, getDevUserLogin } = vi.hoisted(() => ({
  getDevUsers: vi.fn(),
  getDevUserLogin: vi.fn(),
}));

vi.mock('@client/api', () => ({
  DevtoolsApi: class {
    getDevUsers = getDevUsers;
    getDevUserLogin = getDevUserLogin;
  },
}));

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: vi.fn(() => ({ push })) }));

const users = [
  { id: 1, githubId: 'alice', student: [10], mentor: [] },
  { id: 2, githubId: 'bob', student: [], mentor: [20, 30] },
];

describe('DevToolsUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push } as never);
    getDevUsers.mockResolvedValue({ data: users });
    getDevUserLogin.mockResolvedValue({ data: {} });
  });

  it('loads and renders the users table', async () => {
    render(<DevToolsUsers />);

    expect(await screen.findByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(getDevUsers).toHaveBeenCalledTimes(1);
  });

  it('logs in as a user and redirects on the Login action', async () => {
    const user = userEvent.setup();
    render(<DevToolsUsers />);

    await screen.findByText('alice');
    const loginButtons = screen.getAllByRole('button', { name: 'Login' });
    await user.click(loginButtons[0]);

    await waitFor(() => expect(getDevUserLogin).toHaveBeenCalledWith('alice'));
    expect(push).toHaveBeenCalledWith('/api/v2/auth/github/login');
  });

  it('logs an error and does not redirect when login fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getDevUserLogin.mockRejectedValueOnce(new Error('nope'));
    const user = userEvent.setup();
    render(<DevToolsUsers />);

    await screen.findByText('alice');
    await user.click(screen.getAllByRole('button', { name: 'Login' })[0]);

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Failed to login user'));
    expect(push).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('handles a rejected users fetch gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getDevUsers.mockRejectedValueOnce(new Error('fetch failed'));
    render(<DevToolsUsers />);

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    errorSpy.mockRestore();
  });
});
