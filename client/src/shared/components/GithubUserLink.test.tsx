/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GithubUserLink } from './GithubUserLink';

const copyToClipboard = vi.fn();

vi.mock('react-use', () => ({
  useCopyToClipboard: () => [{ value: undefined, error: undefined, noUserInteraction: true }, copyToClipboard],
}));

describe('GithubUserLink', () => {
  beforeEach(() => {
    copyToClipboard.mockClear();
  });

  it('links to the RS App profile page and the GitHub profile page', () => {
    render(<GithubUserLink value="octocat" />);

    const profileLink = screen.getByTitle('Open Rolling Scopes App profile page');
    expect(profileLink).toHaveAttribute('href', '/profile?githubId=octocat');

    const githubLink = screen.getByTitle('Open GitHub profile page');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/octocat');
  });

  it('shows the githubId as the link text by default', () => {
    render(<GithubUserLink value="octocat" />);

    expect(screen.getByText('octocat')).toBeInTheDocument();
  });

  it('shows the full name instead of the githubId when provided', () => {
    render(<GithubUserLink value="octocat" fullName="Octo Cat" />);

    expect(screen.getByText('Octo Cat')).toBeInTheDocument();
    expect(screen.queryByText('octocat')).not.toBeInTheDocument();
  });

  it('renders the avatar by default and hides it when isUserIconHidden is set', () => {
    const { rerender, container } = render(<GithubUserLink value="octocat" />);
    expect(container.querySelector('.ant-avatar')).toBeInTheDocument();

    rerender(<GithubUserLink value="octocat" isUserIconHidden />);
    expect(container.querySelector('.ant-avatar')).not.toBeInTheDocument();
  });

  it('copies the github name to the clipboard when the copy icon is clicked', async () => {
    const user = userEvent.setup();
    render(<GithubUserLink value="octocat" />);

    await user.click(screen.getByTitle('Copy GitHub name to clipboard'));

    expect(copyToClipboard).toHaveBeenCalledWith('octocat');
  });

  it('omits the copy control when copyable is false', () => {
    render(<GithubUserLink value="octocat" copyable={false} />);

    expect(screen.queryByTitle('Copy GitHub name to clipboard')).not.toBeInTheDocument();
  });
});
