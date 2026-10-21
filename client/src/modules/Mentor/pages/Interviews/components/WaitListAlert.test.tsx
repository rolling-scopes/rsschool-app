import { fireEvent, render, screen } from '@testing-library/react';
import { WaitListAlert } from './WaitListAlert';

// next/link is globally aliased to a mock; it renders an anchor with href.
vi.mock('antd', () => ({
  Alert: ({
    title,
    description,
    onClose,
  }: {
    title: React.ReactNode;
    description: React.ReactNode;
    onClose: () => void;
  }) => (
    <div role="alert">
      <span>{title}</span>
      {description}
      <button aria-label="close" onClick={onClose} />
    </div>
  ),
  theme: { useToken: () => ({ token: { blue7: '#00f' } }) },
  Typography: {
    Text: ({ children, onClick }: React.ComponentProps<'span'>) => <span onClick={onClick}>{children}</span>,
  },
}));

describe('WaitListAlert', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('should render, preserve description clicks, dismiss, and honor stored dismissal', () => {
    const { unmount } = render(<WaitListAlert courseAlias="rs-2025" interviewId={7} startDate="2025-01-01" />);

    expect(screen.getByText('Do you want to interview more students?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /students' waitlist/ })).toHaveAttribute(
      'href',
      '/course/mentor/interview-wait-list?course=rs-2025&interviewId=7',
    );

    fireEvent.click(screen.getByText(/Excellent candidates are waiting/));
    expect(screen.getByText('Do you want to interview more students?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(screen.queryByText('Do you want to interview more students?')).not.toBeInTheDocument();
    unmount();
    window.sessionStorage.setItem('waitlist-alert-7', 'true');

    render(<WaitListAlert courseAlias="rs-2025" interviewId={7} startDate="2025-01-01" />);

    expect(screen.queryByText('Do you want to interview more students?')).not.toBeInTheDocument();
  });
});
