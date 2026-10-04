/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { GithubAvatar } from './GithubAvatar';
import { CDN_AVATARS_URL } from '@client/configs/cdn';

describe('GithubAvatar', () => {
  it('renders real, missing, masked, and styled avatar states', () => {
    const { container, rerender } = render(<GithubAvatar githubId="octocat" size={48} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', `${CDN_AVATARS_URL}/octocat.png?size=96`);

    rerender(<GithubAvatar size={24} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.ant-avatar')).toBeInTheDocument();

    rerender(<GithubAvatar githubId="gdpr-12345" size={32} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    rerender(<GithubAvatar githubId="octocat" size={96} style={{ opacity: 0.5 }} />);

    expect(container.querySelector('.ant-avatar')).toHaveStyle({ opacity: '0.5' });
  });
});
