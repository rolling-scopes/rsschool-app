import { render, screen } from '@testing-library/react';
import { InterviewerWidget } from '@client/components/Profile/ui';

describe('InterviewerWidget', () => {
  it('renders interviewer name with link to profile', () => {
    const interviewer = { name: 'Alice', githubId: 'alice' };

    render(<InterviewerWidget interviewer={interviewer} />);

    expect(screen.getByText(/Interviewer/)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Alice/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/profile?githubId=alice'));
  });

  it('renders vertical layout without colon in the label', () => {
    const interviewer = { name: 'Bob', githubId: 'bob' };

    render(<InterviewerWidget interviewer={interviewer} vertical />);

    expect(screen.getByText('Interviewer')).toBeInTheDocument();
    expect(screen.queryByText('Interviewer:')).not.toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Bob/ });
    expect(link).toHaveAttribute('href', expect.stringContaining('/profile?githubId=bob'));
  });
});
