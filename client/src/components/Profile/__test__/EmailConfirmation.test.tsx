import { fireEvent, render, screen } from '@testing-library/react';
import { EmailConfirmation } from '../EmailConfirmation';

vi.mock('@client/shared/components/Timer', () => ({
  Timer: ({ seconds, onElapsed }: { seconds: number; onElapsed: () => void }) => (
    <span>
      timer:{seconds}
      <button onClick={onElapsed}>elapse</button>
    </span>
  ),
}));

vi.mock('antd', () => ({
  Alert: ({ title }: { title: React.ReactNode }) => <div role="alert">{title}</div>,
}));

describe('EmailConfirmation', () => {
  it('handles resend, timer elapsed, recent, old, and changed connection states', () => {
    const sendConfirmationEmail = vi.fn();
    const { rerender } = render(
      <EmailConfirmation connection={undefined} sendConfirmationEmail={sendConfirmationEmail} />,
    );

    const link = screen.getByText('Send confirmation email?');
    expect(link).toBeInTheDocument();
    expect(screen.queryByText(/timer:/)).not.toBeInTheDocument();

    fireEvent.click(link);
    expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
    // After clicking, lastSent is set to now -> link replaced by the Timer branch
    expect(screen.queryByText('Send confirmation email?')).not.toBeInTheDocument();
    expect(screen.getByText(/timer:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'elapse' }));
    expect(screen.getByText('Send confirmation email?')).toBeInTheDocument();
    expect(screen.queryByText(/timer:/)).not.toBeInTheDocument();

    rerender(
      <EmailConfirmation
        connection={{ value: 'a@b.com', enabled: true, lastLinkSentAt: new Date().toISOString() }}
        sendConfirmationEmail={sendConfirmationEmail}
      />,
    );

    expect(screen.queryByText('Send confirmation email?')).not.toBeInTheDocument();
    expect(screen.getByText(/timer:/)).toBeInTheDocument();
    expect(screen.getByText('Send confirmation email in')).toBeInTheDocument();

    const old = new Date(Date.now() - 120 * 1000).toISOString();
    rerender(
      <EmailConfirmation
        connection={{ value: 'a@b.com', enabled: true, lastLinkSentAt: old }}
        sendConfirmationEmail={sendConfirmationEmail}
      />,
    );

    expect(screen.getByText('Send confirmation email?')).toBeInTheDocument();
    expect(screen.queryByText(/timer:/)).not.toBeInTheDocument();

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
