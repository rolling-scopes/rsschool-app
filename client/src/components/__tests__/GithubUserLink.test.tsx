import { fireEvent, render, screen } from '@testing-library/react';
import { GithubUserLink } from '@client/shared/components/GithubUserLink';
import { useCopyToClipboard } from 'react-use';

vi.mock('@client/hooks', () => ({
  useMessage: () => ({
    message: { success: mockSuccess },
  }),
}));

vi.mock('react-use', () => ({
  useCopyToClipboard: vi.fn(),
}));

const TEST_VALUE = 'test-value';
const TEST_FULL_NAME = 'test-full-name';

const mockSuccess = vi.fn();
const mockCopyToClipboard = vi.fn();

describe('GithubUserLink', () => {
  beforeEach(() => {
    vi.mocked(useCopyToClipboard).mockReturnValue([{ noUserInteraction: true }, mockCopyToClipboard]);
  });

  it('should render links, labels, avatar, copy control, and hidden variants', () => {
    const DEFAULT_NUMBER_OF_LINKS = 2;
    const { rerender } = render(<GithubUserLink value={TEST_VALUE} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(DEFAULT_NUMBER_OF_LINKS);
    expect(links.some(l => l.getAttribute('href') === `/profile?githubId=${TEST_VALUE}`)).toBe(true);
    expect(links.some(l => l.getAttribute('href') === `https://github.com/${TEST_VALUE}`)).toBe(true);
    expect(screen.getAllByRole('img').some(img => img.getAttribute('src')?.includes('avatars'))).toBe(true);

    const copyButton = screen.getByTitle('Copy GitHub name to clipboard');
    expect(copyButton).toBeInTheDocument();
    fireEvent.click(copyButton);
    expect(mockCopyToClipboard).toHaveBeenCalledWith(TEST_VALUE);

    rerender(<GithubUserLink value={TEST_VALUE} fullName={TEST_FULL_NAME} />);
    expect(screen.getByText(TEST_FULL_NAME)).toBeInTheDocument();

    rerender(<GithubUserLink value={TEST_VALUE} isUserIconHidden />);
    expect(screen.getAllByRole('img').some(img => img.getAttribute('src')?.includes('avatars'))).toBe(false);

    rerender(<GithubUserLink value={TEST_VALUE} copyable={false} />);
    expect(screen.queryByTitle('Copy GitHub name to clipboard')).not.toBeInTheDocument();
  });
});
