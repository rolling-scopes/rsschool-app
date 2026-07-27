import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PersonalAccessTokenDto } from '@client/api';
import { UserTokensAdminPage } from './UserTokensAdminPage';

// vi.mock is hoisted above these declarations, so the spies must come from
// vi.hoisted (a plain const would still be in its TDZ when the factory runs).
const { getAllPersonalAccessTokens, createPersonalAccessTokenForUser, revokePersonalAccessTokenAsAdmin, searchUsers } =
  vi.hoisted(() => ({
    getAllPersonalAccessTokens: vi.fn(),
    createPersonalAccessTokenForUser: vi.fn(),
    revokePersonalAccessTokenAsAdmin: vi.fn(),
    searchUsers: vi.fn(),
  }));

vi.mock('@client/api', () => ({
  PersonalAccessTokensApi: class {
    getAllPersonalAccessTokens = getAllPersonalAccessTokens;
    createPersonalAccessTokenForUser = createPersonalAccessTokenForUser;
    revokePersonalAccessTokenAsAdmin = revokePersonalAccessTokenAsAdmin;
  },
  UsersApi: class {
    searchUsers = searchUsers;
  },
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ courses: [] }),
}));

vi.mock('@client/hooks', () => ({
  useMessage: () => ({ message: { success: vi.fn(), error: vi.fn() } }),
}));

vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// The real UserSearch is an async antd Select; stub it as a plain input so the
// Form.Item still wires value/onChange.
vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: ({ value, onChange }: { value?: number; onChange?: (id: number) => void }) => (
    <input aria-label="user" value={value ?? ''} onChange={event => onChange?.(Number(event.target.value))} />
  ),
}));

const FUTURE = '2099-12-31T00:00:00.000Z';

function makeToken(overrides: Partial<PersonalAccessTokenDto> = {}): PersonalAccessTokenDto {
  return {
    id: 'token-1',
    userId: 7,
    userGithubId: 'owner-user',
    name: 'agent token',
    prefix: 'AbCdEfGh',
    expiresAt: FUTURE,
    lastUsedAt: null,
    revokedAt: null,
    createdById: 7,
    createdByGithubId: 'owner-user',
    createdAt: '2026-07-20T00:00:00.000Z',
    ...overrides,
  } as PersonalAccessTokenDto;
}

function respondWith(tokens: PersonalAccessTokenDto[], total = tokens.length) {
  getAllPersonalAccessTokens.mockResolvedValue({
    data: { items: tokens, meta: { current: 1, pageSize: 50, total, totalPages: 1, itemCount: tokens.length } },
  });
}

async function showPage(tokens: PersonalAccessTokenDto[] = [makeToken()]) {
  respondWith(tokens);
  render(<UserTokensAdminPage />);
  await waitFor(() => expect(getAllPersonalAccessTokens).toHaveBeenCalled());
  return (await screen.findAllByRole('row'))[1]!;
}

/** Positional args of getAllPersonalAccessTokens, by index. */
const lastCall = () => getAllPersonalAccessTokens.mock.calls.at(-1) ?? [];

/** antd only gives sortable headers an aria-label, so match on the title text. */
const header = (name: string) => screen.getAllByRole('columnheader').find(cell => cell.textContent?.includes(name))!;

/**
 * antd renders the filter trigger twice (visible header + hidden measure row),
 * so the click must be scoped to the header cell we mean.
 */
async function openFilter(columnName: string) {
  const trigger = within(header(columnName)).getByRole('button');
  await userEvent.click(trigger);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserTokensAdminPage loading', () => {
  it('loads the first page for every user on mount, newest first', async () => {
    await showPage();
    expect(lastCall()).toEqual([undefined, undefined, undefined, undefined, 'createdAt', 'desc', 1, 50]);
  });

  it('shows the owner in its own column', async () => {
    const row = await showPage([makeToken({ userGithubId: 'student-1', userId: 9, createdById: 9 })]);
    expect(within(row).getByText('student-1')).toBeInTheDocument();
  });

  it('falls back to the user id when the owner login is missing', async () => {
    const row = await showPage([makeToken({ userGithubId: null })]);
    expect(within(row).getByText('#7')).toBeInTheDocument();
  });

  it('renders the total from the server meta', async () => {
    respondWith([makeToken()], 123);
    render(<UserTokensAdminPage />);
    expect(await screen.findByText('Total 123 tokens')).toBeInTheDocument();
  });
});

describe('UserTokensAdminPage issuer column', () => {
  it('repeats the owner as issuer for a self-service token', async () => {
    const row = await showPage();
    // Owner and issuer are the same person, so the login shows in both columns.
    expect(within(row).getAllByText('owner-user')).toHaveLength(2);
  });

  it('shows the admin who issued a token for somebody else', async () => {
    const row = await showPage([makeToken({ createdById: 1, createdByGithubId: 'admin-user' })]);
    expect(within(row).getByText('owner-user')).toBeInTheDocument();
    expect(within(row).getByText('admin-user')).toBeInTheDocument();
  });

  it('falls back to the issuer id when the login is missing', async () => {
    const row = await showPage([makeToken({ createdById: 1, createdByGithubId: null })]);
    expect(within(row).getByText('#1')).toBeInTheDocument();
  });
});

describe('UserTokensAdminPage status column', () => {
  it('marks a revoked token', async () => {
    const row = await showPage([makeToken({ revokedAt: '2026-07-21T00:00:00.000Z' })]);
    expect(within(row).getByText('revoked')).toBeInTheDocument();
  });

  it('marks a token past its expiry as expired, not active', async () => {
    const row = await showPage([makeToken({ expiresAt: '2020-01-01T00:00:00.000Z' })]);
    expect(within(row).getByText('expired')).toBeInTheDocument();
  });

  it('marks a live token as active', async () => {
    const row = await showPage();
    expect(within(row).getByText('active')).toBeInTheDocument();
  });
});

describe('UserTokensAdminPage table search and sort', () => {
  it('sends a column search to the server', async () => {
    await showPage();
    await openFilter('Owner');
    const input = await screen.findByPlaceholderText('Search owner');
    await userEvent.type(input, 'octo');
    // The shared dropdown confirms on the legacy `keyCode`, which userEvent's
    // `{enter}` no longer sets — hence fireEvent here.
    fireEvent.keyDown(input, { keyCode: 13 });

    await waitFor(() => expect(getAllPersonalAccessTokens).toHaveBeenCalledTimes(2));
    expect(lastCall()[0]).toBe('octo');
  });

  it('sends the status filter as a single value', async () => {
    await showPage();
    await openFilter('Status');
    await userEvent.click(await screen.findByRole('menuitem', { name: 'revoked' }));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(getAllPersonalAccessTokens).toHaveBeenCalledTimes(2));
    expect(lastCall()[3]).toBe('revoked');
  });

  it('sorts by the column key the API expects, not the dataIndex', async () => {
    await showPage();
    await userEvent.click(header('Owner'));

    await waitFor(() => expect(getAllPersonalAccessTokens).toHaveBeenCalledTimes(2));
    expect(lastCall()[4]).toBe('githubId');
    expect(lastCall()[5]).toBe('asc');
  });
});

describe('UserTokensAdminPage issuing', () => {
  it('issues a token for the user picked in the modal and reloads', async () => {
    createPersonalAccessTokenForUser.mockResolvedValue({ data: { ...makeToken(), token: 'rsapp_pat_x_y' } });
    await showPage();

    await userEvent.click(screen.getByRole('button', { name: /issue token/i }));
    const modal = (await screen.findByRole('dialog')) as HTMLElement;
    await userEvent.type(within(modal).getByLabelText('user'), '42');
    await userEvent.type(within(modal).getByPlaceholderText(/CI bootstrap token/i), 'CI token');
    await userEvent.click(within(modal).getByRole('button', { name: 'Issue' }));

    await waitFor(() =>
      expect(createPersonalAccessTokenForUser).toHaveBeenCalledWith(42, { name: 'CI token', expiresInDays: 90 }),
    );
    await waitFor(() => expect(getAllPersonalAccessTokens).toHaveBeenCalledTimes(2));
  });

  it('revokes a token and reloads', async () => {
    revokePersonalAccessTokenAsAdmin.mockResolvedValue({});
    await showPage();

    await userEvent.click(screen.getByRole('button', { name: /revoke/i }));
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }));

    await waitFor(() => expect(revokePersonalAccessTokenAsAdmin).toHaveBeenCalledWith('token-1'));
    await waitFor(() => expect(getAllPersonalAccessTokens).toHaveBeenCalledTimes(2));
  });

  it('hides the revoke action for an already-revoked token', async () => {
    const row = await showPage([makeToken({ revokedAt: '2026-07-21T00:00:00.000Z' })]);
    expect(within(row).queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument();
  });
});
