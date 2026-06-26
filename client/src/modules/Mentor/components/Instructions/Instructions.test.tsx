import { render, screen, waitFor } from '@testing-library/react';
import { INSTRUCTIONS_TEXT } from '.';
import Instructions from './Instructions';

const { getInviteLinkByDiscordServerId } = vi.hoisted(() => ({
  getInviteLinkByDiscordServerId: vi.fn(),
}));

vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  return {
    ...actual,
    DiscordServersApi: class {
      getInviteLinkByDiscordServerId = getInviteLinkByDiscordServerId;
    },
  };
});

describe('Instructions', () => {
  beforeEach(() => getInviteLinkByDiscordServerId.mockReset().mockResolvedValue({ data: 'https://t.me/rsschool' }));

  it('should render the title and description', () => {
    render(<Instructions courseId={400} discordServerId={1} />);

    expect(screen.getByText(INSTRUCTIONS_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(INSTRUCTIONS_TEXT.description)).toBeInTheDocument();
  });

  it('should render each instruction step title', () => {
    render(<Instructions courseId={400} discordServerId={1} />);

    for (const step of INSTRUCTIONS_TEXT.steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    }
  });

  it('should render the social links for the first step (github/discord/linkedin)', () => {
    render(<Instructions courseId={400} discordServerId={1} />);

    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/rolling-scopes/rsschool-app',
    );
  });

  it('should fetch and apply the telegram invite link when a discord server id is provided', async () => {
    render(<Instructions courseId={400} discordServerId={42} />);

    await waitFor(() => expect(getInviteLinkByDiscordServerId).toHaveBeenCalledWith(400, 42));

    // once the telegram url resolves, the telegram link becomes clickable with that href
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.some(link => link.getAttribute('href') === 'https://t.me/rsschool')).toBe(true);
    });
  });

  it('should not fetch the invite link when there is no discord server id', () => {
    render(<Instructions courseId={400} discordServerId={0} />);

    expect(getInviteLinkByDiscordServerId).not.toHaveBeenCalled();
  });
});
