import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaitListAlert } from './WaitListAlert';

// next/link is globally aliased to a mock; it renders an anchor with href.

describe('WaitListAlert', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('should render the waitlist invitation with a link to the wait list', () => {
    render(<WaitListAlert courseAlias="rs-2025" interviewId={7} startDate="2025-01-01" />);

    expect(screen.getByText('Do you want to interview more students?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /students' waitlist/ })).toHaveAttribute(
      'href',
      '/course/mentor/interview-wait-list?course=rs-2025&interviewId=7',
    );
  });

  it('should hide the alert after it is dismissed', async () => {
    const user = userEvent.setup();
    render(<WaitListAlert courseAlias="rs-2025" interviewId={7} startDate="2025-01-01" />);

    await user.click(screen.getByRole('img', { name: 'close' }));

    expect(screen.queryByText('Do you want to interview more students?')).not.toBeInTheDocument();
  });

  it('should not render when previously dismissed in session storage', () => {
    window.sessionStorage.setItem('waitlist-alert-7', 'true');

    render(<WaitListAlert courseAlias="rs-2025" interviewId={7} startDate="2025-01-01" />);

    expect(screen.queryByText('Do you want to interview more students?')).not.toBeInTheDocument();
  });

  it('should keep the alert open when its description text is clicked (stopPropagation)', async () => {
    const user = userEvent.setup();
    render(<WaitListAlert courseAlias="rs-2025" interviewId={7} startDate="2025-01-01" />);

    // clicking the description text fires the onClick stopPropagation handler and
    // must not dismiss the alert
    await user.click(screen.getByText(/Excellent candidates are waiting/));

    expect(screen.getByText('Do you want to interview more students?')).toBeInTheDocument();
  });
});
