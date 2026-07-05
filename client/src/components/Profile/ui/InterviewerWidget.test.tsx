import { render, screen } from '@testing-library/react';
import { InterviewerWidget } from './InterviewerWidget';

// GithubAvatar loads a remote image; stub to a marker element.
vi.mock('@client/shared/components/GithubAvatar', () => ({
  GithubAvatar: ({ githubId }: { githubId: string }) => <span data-testid="avatar">{githubId}</span>,
}));

const interviewer = { name: 'Jane Doe', githubId: 'jane' };

describe('InterviewerWidget', () => {
  it('renders the interviewer name, avatar and profile link', () => {
    render(<InterviewerWidget interviewer={interviewer} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveTextContent('jane');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/profile?githubId=jane');
  });

  it('renders the label with a colon in horizontal layout', () => {
    render(<InterviewerWidget interviewer={interviewer} />);
    expect(screen.getByText(/Interviewer/)).toHaveTextContent('Interviewer :');
  });

  it('renders the label without a colon in vertical layout', () => {
    render(<InterviewerWidget interviewer={interviewer} vertical />);
    const label = screen.getByText(/Interviewer/);
    expect(label.textContent?.trim()).toBe('Interviewer');
  });
});
