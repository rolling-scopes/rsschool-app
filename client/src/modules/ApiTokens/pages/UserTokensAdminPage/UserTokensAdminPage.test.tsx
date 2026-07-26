import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PersonalAccessTokenDto } from '@client/api';
import { UserTokensAdminPage } from './UserTokensAdminPage';

// vi.mock is hoisted above these declarations, so the spies must come from
// vi.hoisted (a plain const would still be in its TDZ when the factory runs).
const {
  getPersonalAccessTokensForUser,
  createPersonalAccessTokenForUser,
  revokePersonalAccessTokenAsAdmin,
  searchUsers,
} = vi.hoisted(() => ({
  getPersonalAccessTokensForUser: vi.fn(),
  createPersonalAccessTokenForUser: vi.fn(),
  revokePersonalAccessTokenAsAdmin: vi.fn(),
  searchUsers: vi.fn(),
}));

vi.mock('@client/api', () => ({
  PersonalAccessTokensApi: class {
    getPersonalAccessTokensForUser = getPersonalAccessTokensForUser;
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
// Form.Item still wires value/onChange and the form can be submitted.
vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: ({ value, onChange }: { value?: number; onChange?: (id: number) => void }) => (
    <input aria-label="user" value={value ?? ''} onChange={event => onChange?.(Number(event.target.value))} />
  ),
}));

function makeToken(overrides: Partial<PersonalAccessTokenDto> = {}): PersonalAccessTokenDto {
  return {
    id: 'token-1',
    userId: 7,
    name: 'agent token',
    prefix: 'AbCdEfGh',
    expiresAt: '2026-12-31T00:00:00.000Z',
    lastUsedAt: null,
    revokedAt: null,
    createdById: 7,
    createdByGithubId: 'owner-user',
    createdAt: '2026-07-20T00:00:00.000Z',
    ...overrides,
  } as PersonalAccessTokenDto;
}

async function renderWithTokens(tokens: PersonalAccessTokenDto[]) {
  getPersonalAccessTokensForUser.mockResolvedValue({ data: tokens });
  render(<UserTokensAdminPage />);
  await userEvent.type(screen.getByLabelText('user'), '7');
  await userEvent.click(screen.getByRole('button', { name: 'Load' }));
  await waitFor(() => expect(getPersonalAccessTokensForUser).toHaveBeenCalledWith(7));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserTokensAdminPage issuer column', () => {
  it('shows who issued a self-service token without the "on behalf" tag', async () => {
    await renderWithTokens([makeToken()]);

    const row = (await screen.findAllByRole('row'))[1]!;
    expect(within(row).getByText('owner-user')).toBeInTheDocument();
    expect(within(row).queryByText('on behalf')).not.toBeInTheDocument();
  });

  it('flags a token an admin issued for somebody else', async () => {
    await renderWithTokens([makeToken({ createdById: 1, createdByGithubId: 'admin-user' })]);

    const row = (await screen.findAllByRole('row'))[1]!;
    expect(within(row).getByText('admin-user')).toBeInTheDocument();
    expect(within(row).getByText('on behalf')).toBeInTheDocument();
  });
});
