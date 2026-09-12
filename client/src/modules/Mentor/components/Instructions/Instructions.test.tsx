import { render, screen, waitFor } from '@testing-library/react';
import { INSTRUCTIONS_TEXT, renderSocialLinks } from '.';
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

  it('renders the instructions and applies the fetched telegram invite link', async () => {
    render(<Instructions courseId={400} discordServerId={42} />);

    expect(screen.getByText(INSTRUCTIONS_TEXT.title)).toBeInTheDocument();
    expect(screen.getByText(INSTRUCTIONS_TEXT.description)).toBeInTheDocument();
    for (const step of INSTRUCTIONS_TEXT.steps) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/rolling-scopes/rsschool-app',
    );

    await waitFor(() => expect(getInviteLinkByDiscordServerId).toHaveBeenCalledWith(400, 42));
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.some(link => link.getAttribute('href') === 'https://t.me/rsschool')).toBe(true);
    });
  });

  it('should not fetch the invite link when there is no discord server id', () => {
    render(<Instructions courseId={400} discordServerId={0} />);

    expect(getInviteLinkByDiscordServerId).not.toHaveBeenCalled();
  });

  it('renders a social link with no icon for an unknown platform title', () => {
    function Host() {
      return <>{renderSocialLinks([{ title: 'myspace', url: 'https://myspace.com/rs' }])}</>;
    }
    render(<Host />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://myspace.com/rs');
  });
});
