import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ObfuscationModal from '../ObfuscateConfirmationModal';

const { obfuscateProfile } = vi.hoisted(() => ({
  obfuscateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@client/api', () => ({
  ProfileApi: vi.fn(function () {
    return { obfuscateProfile };
  }),
}));

const reload = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload },
    writable: true,
  });
});

beforeEach(() => {
  obfuscateProfile.mockClear();
  reload.mockClear();
});

function renderModal(overrides: Partial<React.ComponentProps<typeof ObfuscationModal>> = {}) {
  const props = {
    githubId: 'octocat',
    setIsModalVisible: vi.fn(),
    open: true,
    ...overrides,
  };
  return { props, ...render(<ObfuscationModal {...props} />) };
}

describe('ObfuscationModal', () => {
  it('shows an error and does not obfuscate when the nickname does not match', async () => {
    const user = userEvent.setup();
    renderModal({ githubId: 'octocat' });

    await user.type(screen.getByPlaceholderText('Enter GitHub nickname'), 'wrong');
    await user.click(screen.getByRole('button', { name: /OK/i }));

    expect(screen.getByText('Nickname does not match. Please try again.')).toBeInTheDocument();
    expect(obfuscateProfile).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('obfuscates the profile and reloads when the nickname matches', async () => {
    const user = userEvent.setup();
    renderModal({ githubId: 'octocat' });

    await user.type(screen.getByPlaceholderText('Enter GitHub nickname'), 'octocat');
    await user.click(screen.getByRole('button', { name: /OK/i }));

    await waitFor(() => expect(obfuscateProfile).toHaveBeenCalledWith('octocat'));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Nickname does not match. Please try again.')).not.toBeInTheDocument();
  });

  it('does not obfuscate when githubId is null even if input matches text', async () => {
    const user = userEvent.setup();
    renderModal({ githubId: null });

    await user.type(screen.getByPlaceholderText('Enter GitHub nickname'), 'whatever');
    await user.click(screen.getByRole('button', { name: /OK/i }));

    expect(obfuscateProfile).not.toHaveBeenCalled();
    expect(screen.getByText('Nickname does not match. Please try again.')).toBeInTheDocument();
  });

  it('clears the validation error when the user types again', async () => {
    const user = userEvent.setup();
    renderModal({ githubId: 'octocat' });

    const input = screen.getByPlaceholderText('Enter GitHub nickname');
    await user.type(input, 'wrong');
    await user.click(screen.getByRole('button', { name: /OK/i }));
    expect(screen.getByText('Nickname does not match. Please try again.')).toBeInTheDocument();

    await user.type(input, 'x');
    expect(screen.queryByText('Nickname does not match. Please try again.')).not.toBeInTheDocument();
  });

  it('calls setIsModalVisible(false) and resets state on cancel', async () => {
    const user = userEvent.setup();
    const setIsModalVisible = vi.fn();
    renderModal({ githubId: 'octocat', setIsModalVisible });

    await user.type(screen.getByPlaceholderText('Enter GitHub nickname'), 'wrong');
    await user.click(screen.getByRole('button', { name: /OK/i }));
    expect(screen.getByText('Nickname does not match. Please try again.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(setIsModalVisible).toHaveBeenCalledWith(false);
    // error reset on cancel
    expect(screen.queryByText('Nickname does not match. Please try again.')).not.toBeInTheDocument();
  });
});
