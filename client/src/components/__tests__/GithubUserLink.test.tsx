import { act, render, screen } from '@testing-library/react';
import { GithubUserLink } from '@client/components/GithubUserLink';
import { useMessage } from 'hooks';
import { useCopyToClipboard } from 'react-use';

jest.mock('hooks', () => ({
  useMessage: jest.fn(),
}));

jest.mock('react-use', () => ({
  useCopyToClipboard: jest.fn(),
}));

const TEST_VALUE = 'test-value';
const TEST_FULL_NAME = 'test-full-name';

describe('GithubUserLink', () => {
  const mockSuccess = jest.fn();
  const mockCopyToClipboard = jest.fn();

  beforeEach(() => {
    (useMessage as jest.Mock).mockReturnValue({ message: { success: mockSuccess } });
    (useCopyToClipboard as jest.Mock).mockReturnValue([null, mockCopyToClipboard]);
  });

  it('should render correct links', () => {
    const DEFAULT_NUMBER_OF_LINKS = 2;
    render(<GithubUserLink value={TEST_VALUE} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(DEFAULT_NUMBER_OF_LINKS);
    expect(links.some(l => l.getAttribute('href') === `/profile?githubId=${TEST_VALUE}`)).toBe(true);
    expect(links.some(l => l.getAttribute('href') === `https://github.com/${TEST_VALUE}`)).toBe(true);
  });

  it('should render provided full name', () => {
    render(<GithubUserLink value={TEST_VALUE} fullName={TEST_FULL_NAME} />);
    expect(screen.getByText(TEST_FULL_NAME)).toBeInTheDocument();
  });

  it('should not render user avatar by default', () => {
    render(<GithubUserLink value={TEST_VALUE} />);
    const imgs = screen.getAllByRole('img');
    const avatar = imgs.some(img => img.getAttribute('src')?.includes('avatars'));
    expect(avatar).toBe(true);
  });

  it('should not render user avatar if isUserIconHidden === false', () => {
    render(<GithubUserLink value={TEST_VALUE} isUserIconHidden={true} />);
    const imgs = screen.getAllByRole('img');
    const avatar = imgs.some(img => img.getAttribute('src')?.includes('avatars'));
    expect(avatar).toBe(false);
  });

  it('should render copy button be default', () => {
    render(<GithubUserLink value={TEST_VALUE} />);
    const copyButton = screen.getByTitle('Copy GitHub name to clipboard');
    expect(copyButton).toBeInTheDocument();
  });

  it('should no render copy button if copyable === false', () => {
    render(<GithubUserLink value={TEST_VALUE} copyable={false} />);
    const copyButton = screen.queryByTitle('Copy GitHub name to clipboard');
    expect(copyButton).not.toBeInTheDocument();
  });

  it('should copy value to clipboard on click', async () => {
    render(<GithubUserLink value={TEST_VALUE} />);
    const copyButton = screen.getByTitle('Copy GitHub name to clipboard');
    await act(async () => copyButton.click());
    expect(mockCopyToClipboard).toHaveBeenCalledWith(TEST_VALUE);
    expect(mockSuccess).toHaveBeenCalledWith("User's name copied to clipboard");
  });
});
