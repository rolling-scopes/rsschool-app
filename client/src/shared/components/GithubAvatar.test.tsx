/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import { GithubAvatar } from './GithubAvatar';
import { CDN_AVATARS_URL } from '@client/configs/cdn';

describe('GithubAvatar', () => {
  it('renders an avatar image for a real githubId', () => {
    render(<GithubAvatar githubId="octocat" size={48} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', `${CDN_AVATARS_URL}/octocat.png?size=96`);
  });

  it('renders an empty avatar (no image) when githubId is missing', () => {
    const { container } = render(<GithubAvatar size={24} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.ant-avatar')).toBeInTheDocument();
  });

  it('renders an empty avatar for gdpr-masked githubIds', () => {
    render(<GithubAvatar githubId="gdpr-12345" size={32} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('forwards inline styles to the avatar', () => {
    const { container } = render(<GithubAvatar githubId="octocat" size={96} style={{ opacity: 0.5 }} />);

    expect(container.querySelector('.ant-avatar')).toHaveStyle({ opacity: '0.5' });
  });
});
