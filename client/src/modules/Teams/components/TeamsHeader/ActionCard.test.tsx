import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionCard } from './ActionCard';

function renderCard(overrides: Partial<Parameters<typeof ActionCard>[0]> = {}) {
  const onClick = vi.fn();
  render(
    <ActionCard
      title="Become a leader"
      text="Create a team and lead it"
      buttonCaption="Create team"
      onClick={onClick}
      {...overrides}
    />,
  );
  return { onClick };
}

describe('<ActionCard />', () => {
  it('renders the title, text and button caption', () => {
    renderCard();
    expect(screen.getByText('Become a leader')).toBeInTheDocument();
    expect(screen.getByText('Create a team and lead it')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create team' })).toBeInTheDocument();
  });

  it('asks for confirmation and calls onClick only after confirming', async () => {
    const user = userEvent.setup();
    const { onClick } = renderCard();

    await user.click(screen.getByRole('button', { name: 'Create team' }));

    // Popconfirm uses lowercased caption in its prompt.
    expect(await screen.findByText(/are you sure you want to create team\?/i)).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /^ok$/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const { onClick } = renderCard();

    await user.click(screen.getByRole('button', { name: 'Create team' }));
    await screen.findByText(/are you sure you want to create team\?/i);
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
