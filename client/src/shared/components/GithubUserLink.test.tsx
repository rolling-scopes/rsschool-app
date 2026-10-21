/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { fireEvent, render, screen } from '@testing-library/react';
import { GithubUserLink } from './GithubUserLink';

const copyToClipboard = vi.fn();

vi.mock('react-use', () => ({
  useCopyToClipboard: () => [{ value: undefined, error: undefined, noUserInteraction: true }, copyToClipboard],
}));

describe('GithubUserLink', () => {
  beforeEach(() => {
    copyToClipboard.mockClear();
  });

  it('renders links, labels, avatar, copy behavior, and hidden variants', () => {
    const { container, rerender } = render(<GithubUserLink value="octocat" />);

    const profileLink = screen.getByTitle('Open Rolling Scopes App profile page');
    expect(profileLink).toHaveAttribute('href', '/profile?githubId=octocat');

    const githubLink = screen.getByTitle('Open GitHub profile page');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/octocat');

    expect(screen.getByText('octocat')).toBeInTheDocument();
    expect(container.querySelector('.ant-avatar')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Copy GitHub name to clipboard'));
    expect(copyToClipboard).toHaveBeenCalledWith('octocat');

    rerender(<GithubUserLink value="octocat" fullName="Octo Cat" />);

    expect(screen.getByText('Octo Cat')).toBeInTheDocument();
    expect(screen.queryByText('octocat')).not.toBeInTheDocument();

    rerender(<GithubUserLink value="octocat" isUserIconHidden />);
    expect(container.querySelector('.ant-avatar')).not.toBeInTheDocument();

    rerender(<GithubUserLink value="octocat" copyable={false} />);
    expect(screen.queryByTitle('Copy GitHub name to clipboard')).not.toBeInTheDocument();
  });
});
