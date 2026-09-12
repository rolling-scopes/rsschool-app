import { render, screen } from '@testing-library/react';
import { InterviewerWidget } from './InterviewerWidget';

// GithubAvatar loads a remote image; stub to a marker element.
vi.mock('@client/shared/components/GithubAvatar', () => ({
  GithubAvatar: ({ githubId }: { githubId: string }) => <span data-testid="avatar">{githubId}</span>,
}));
vi.mock('antd', () => ({
  Flex: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Space: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  theme: { useToken: () => ({ token: { colorTextTertiary: '#aaa', colorTextBase: '#000' } }) },
  Typography: { Text: ({ children }: React.PropsWithChildren) => <span>{children}</span> },
}));

const interviewer = { name: 'Jane Doe', githubId: 'jane' };

describe('InterviewerWidget', () => {
  it('renders interviewer details in horizontal and vertical layouts', () => {
    const { rerender } = render(<InterviewerWidget interviewer={interviewer} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveTextContent('jane');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/profile?githubId=jane');
    expect(screen.getByText(/Interviewer/)).toHaveTextContent('Interviewer :');

    rerender(<InterviewerWidget interviewer={interviewer} vertical />);
    const label = screen.getByText(/Interviewer/);
    expect(label.textContent?.trim()).toBe('Interviewer');
  });
});
