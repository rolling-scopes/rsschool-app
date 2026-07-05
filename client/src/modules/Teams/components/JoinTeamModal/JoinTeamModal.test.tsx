import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JoinTeamModal from './JoinTeamModal';

function renderModal() {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();
  render(<JoinTeamModal onSubmit={onSubmit} onCancel={onCancel} />);
  return { onSubmit, onCancel };
}

describe('<JoinTeamModal />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the modal with the password field and Join button', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Join team')).toBeInTheDocument();
    expect(screen.getByLabelText('Team password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows a required error and does not submit when the password is empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByText('Please enter team password')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a password that does not match the id_password pattern', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(screen.getByLabelText('Team password'), 'no-underscore');
    await user.click(screen.getByRole('button', { name: /join/i }));

    expect(await screen.findByText('Please enter valid password')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('parses "id_password" and calls onSubmit with the numeric id and password', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(screen.getByLabelText('Team password'), '17_secretPass1');
    await user.click(screen.getByRole('button', { name: /join/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(17, { password: 'secretPass1' });
  });
});
