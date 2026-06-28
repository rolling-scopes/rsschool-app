import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserGroupDto } from '@client/api';
import { UserGroupsModal } from './UserGroupsModal';

// --- Boundary: stub the remote-search UserSearch ---------------------------
// UserSearch is a debounced remote-search antd Select. Replace it with a plain
// control bound to the form field so we can drive a deterministic value.
vi.mock('@client/shared/components/UserSearch', () => ({
  // A round-trip through value.join(',') drops commas on re-render, so expose the
  // current ids as text and let the test pick users via buttons that append an id.
  UserSearch: ({ value, onChange }: { value?: number[]; onChange?: (v: number[]) => void }) => {
    const ids = value ?? [];
    return (
      <span>
        <span aria-label="user-search">{ids.join(',')}</span>
        <button type="button" aria-label="add-user-1" onClick={() => onChange?.([...ids, 1])}>
          add 1
        </button>
        <button type="button" aria-label="add-user-2" onClick={() => onChange?.([...ids, 2])}>
          add 2
        </button>
      </span>
    );
  },
}));

const editGroup = {
  id: 9,
  name: 'Admins',
  users: [{ id: 1, githubId: 'gh1', name: 'User One' }],
  roles: ['manager'],
} as unknown as UserGroupDto;

function makeProps(overrides: Partial<Parameters<typeof UserGroupsModal>[0]> = {}) {
  return {
    data: { users: [] } as Partial<UserGroupDto>,
    title: 'User Group',
    submit: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn(),
    getInitialValues: (d: Partial<UserGroupDto>) => ({ ...d, users: d.users?.map(u => u.id) ?? [] }),
    loading: false,
    loadUsers: vi.fn().mockResolvedValue([]),
    ...overrides,
  } as Parameters<typeof UserGroupsModal>[0];
}

describe('<UserGroupsModal />', () => {
  it('renders nothing when data is null', () => {
    const { container } = render(<UserGroupsModal {...makeProps({ data: null })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title plus name, users and roles fields when creating', () => {
    render(<UserGroupsModal {...makeProps()} />);

    expect(screen.getByText('User Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('user-search')).toHaveTextContent('');
  });

  it('shows validation errors and does not submit when fields are empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<UserGroupsModal {...props} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please enter user group name')).toBeInTheDocument();
    expect(screen.getByText('Please select users')).toBeInTheDocument();
    expect(screen.getByText('Please select permissions')).toBeInTheDocument();
    expect(props.submit).not.toHaveBeenCalled();
  });

  it('submits the name, selected users and a chosen role', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<UserGroupsModal {...props} />);

    await user.type(screen.getByLabelText('Name'), 'Managers');
    // Stubbed UserSearch: pick ids via the helper buttons.
    await user.click(screen.getByLabelText('add-user-1'));
    await user.click(screen.getByLabelText('add-user-2'));

    // Roles is a real antd tags Select — open and pick "manager".
    await user.click(screen.getByLabelText('Roles'));
    await user.click(await screen.findByText('manager', { selector: '.ant-select-item-option-content' }));

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(props.submit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Managers', users: [1, 2], roles: ['manager'] }),
      ),
    );
  });

  it('prefills the name from getInitialValues when editing', () => {
    render(<UserGroupsModal {...makeProps({ data: editGroup })} />);

    expect(screen.getByLabelText('Name')).toHaveValue('Admins');
    expect(screen.getByLabelText('user-search')).toHaveTextContent('1');
  });
});
