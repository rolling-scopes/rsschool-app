import { render, screen } from '@testing-library/react';
import { InterviewerWidget } from '@client/components/Profile/ui';

describe('InterviewerWidget', () => {
  it('renders interviewer details in horizontal and vertical layouts', () => {
    const interviewer = { name: 'Alice', githubId: 'alice' };

    const { rerender } = render(<InterviewerWidget interviewer={interviewer} />);

    expect(screen.getByText(/Interviewer/)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /Alice/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/profile?githubId=alice'));

    rerender(<InterviewerWidget interviewer={interviewer} vertical />);

    expect(screen.getByText('Interviewer')).toBeInTheDocument();
    expect(screen.queryByText('Interviewer:')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Alice/ })).toHaveAttribute(
      'href',
      expect.stringContaining('/profile?githubId=alice'),
    );
  });
});
