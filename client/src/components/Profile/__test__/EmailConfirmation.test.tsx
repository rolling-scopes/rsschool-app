import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailConfirmation } from '../EmailConfirmation';

vi.mock('@client/shared/components/Timer', () => ({
  Timer: ({ seconds, onElapsed }: { seconds: number; onElapsed: () => void }) => (
    <span>
      timer:{seconds}
      <button onClick={onElapsed}>elapse</button>
    </span>
  ),
}));

describe('EmailConfirmation', () => {
  it('shows a clickable resend link when there is no lastLinkSentAt (allowedToResend)', async () => {
    const user = userEvent.setup();
    const sendConfirmationEmail = vi.fn();
    render(<EmailConfirmation connection={undefined} sendConfirmationEmail={sendConfirmationEmail} />);

    const link = screen.getByText('Send confirmation email?');
    expect(link).toBeInTheDocument();
    expect(screen.queryByText(/timer:/)).not.toBeInTheDocument();

    await user.click(link);
    expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
    // After clicking, lastSent is set to now -> link replaced by the Timer branch
    expect(screen.queryByText('Send confirmation email?')).not.toBeInTheDocument();
    expect(screen.getByText(/timer:/)).toBeInTheDocument();
  });

  it('shows the Timer branch when lastLinkSentAt is recent (not allowed to resend)', () => {
    const sendConfirmationEmail = vi.fn();
    render(
      <EmailConfirmation
        connection={{ value: 'a@b.com', enabled: true, lastLinkSentAt: new Date().toISOString() }}
        sendConfirmationEmail={sendConfirmationEmail}
      />,
    );

    expect(screen.queryByText('Send confirmation email?')).not.toBeInTheDocument();
    expect(screen.getByText(/timer:/)).toBeInTheDocument();
    expect(screen.getByText('Send confirmation email in')).toBeInTheDocument();
  });

  it('shows the resend link again when the Timer elapses (onElapsed resets lastSent)', async () => {
    const user = userEvent.setup();
    const sendConfirmationEmail = vi.fn();
    render(
      <EmailConfirmation
        connection={{ value: 'a@b.com', enabled: true, lastLinkSentAt: new Date().toISOString() }}
        sendConfirmationEmail={sendConfirmationEmail}
      />,
    );

    expect(screen.getByText(/timer:/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'elapse' }));
    expect(screen.getByText('Send confirmation email?')).toBeInTheDocument();
    expect(screen.queryByText(/timer:/)).not.toBeInTheDocument();
  });

  it('allows resend when lastLinkSentAt is older than 60 seconds', () => {
    const sendConfirmationEmail = vi.fn();
    const old = new Date(Date.now() - 120 * 1000).toISOString();
    render(
      <EmailConfirmation
        connection={{ value: 'a@b.com', enabled: true, lastLinkSentAt: old }}
        sendConfirmationEmail={sendConfirmationEmail}
      />,
    );

    expect(screen.getByText('Send confirmation email?')).toBeInTheDocument();
    expect(screen.queryByText(/timer:/)).not.toBeInTheDocument();
  });

  it('syncs lastSent when the connection prop changes (useEffect)', () => {
    const sendConfirmationEmail = vi.fn();
    const { rerender } = render(
      <EmailConfirmation connection={undefined} sendConfirmationEmail={sendConfirmationEmail} />,
    );
    expect(screen.getByText('Send confirmation email?')).toBeInTheDocument();

    rerender(
      <EmailConfirmation
        connection={{ value: 'a@b.com', enabled: true, lastLinkSentAt: new Date().toISOString() }}
        sendConfirmationEmail={sendConfirmationEmail}
      />,
    );
    expect(screen.queryByText('Send confirmation email?')).not.toBeInTheDocument();
    expect(screen.getByText(/timer:/)).toBeInTheDocument();
  });
});
