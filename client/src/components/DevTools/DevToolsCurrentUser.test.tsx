import { render, screen, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import DevToolsCurrentUser from './DevToolsCurrentUser';

// SessionApi is constructed at module load; stub the class so no real api call.
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock('@client/api', () => ({
  SessionApi: class {
    getSession = getSession;
  },
}));

// Drive the real fetcher (so the session-api callback runs) through a tiny
// useRequest stand-in backed by React state. This exercises the data path in
// the component rather than stubbing its result wholesale.
vi.mock('ahooks/lib/useRequest', () => ({
  default: (service: () => Promise<unknown>) => {
    const [state, setState] = useState<{ data?: unknown; error?: unknown }>({});
    useEffect(() => {
      let active = true;
      service()
        .then((data: unknown) => active && setState({ data }))
        .catch((error: unknown) => active && setState({ error }));
      return () => {
        active = false;
      };
    }, []);
    return state;
  },
}));

describe('DevToolsCurrentUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders "No active session" while there is no data yet', () => {
    getSession.mockReturnValue(new Promise(() => {}));
    render(<DevToolsCurrentUser />);
    expect(screen.getByText('No active session')).toBeInTheDocument();
  });

  it('renders "No active session" when the request errors', async () => {
    getSession.mockRejectedValue(new Error('boom'));
    render(<DevToolsCurrentUser />);
    await waitFor(() => expect(getSession).toHaveBeenCalled());
    expect(screen.getByText('No active session')).toBeInTheDocument();
  });

  it('fetches and renders the session details', async () => {
    getSession.mockResolvedValue({
      data: { id: 42, githubId: 'octocat', isAdmin: true, courses: { 10: {}, 20: {} } },
    });
    render(<DevToolsCurrentUser />);

    expect(await screen.findByText('Active user session')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('octocat')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('10,20')).toBeInTheDocument();
  });

  it('shows admin false for a non-admin session', async () => {
    getSession.mockResolvedValue({
      data: { id: 1, githubId: 'g', isAdmin: false, courses: {} },
    });
    render(<DevToolsCurrentUser />);

    expect(await screen.findByText('false')).toBeInTheDocument();
  });

  it('falls back to an empty course list when courses is missing', async () => {
    getSession.mockResolvedValue({
      data: { id: 5, githubId: 'nocourses', isAdmin: false, courses: undefined },
    });
    render(<DevToolsCurrentUser />);

    expect(await screen.findByText('nocourses')).toBeInTheDocument();
    expect(screen.getByText('User ID')).toBeInTheDocument();
  });
});
