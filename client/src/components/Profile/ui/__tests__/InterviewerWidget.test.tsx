import { render, screen } from '@testing-library/react';
import { InterviewerWidget } from '@client/components/Profile/ui';

describe('InterviewerWidget', () => {
  it('renders interviewer name with link to profile', () => {
    const interviewer = { name: 'Alice', githubId: 'alice' };

    render(<InterviewerWidget interviewer={interviewer} />);

    expect(screen.getByText('Interviewer:')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Alice' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/profile?githubId=alice'));
  });
});
