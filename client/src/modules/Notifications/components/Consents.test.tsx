import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { Consents, Connection } from './Consents';

// --- Mocks -----------------------------------------------------------------

const { sendEmailConfirmationLink } = vi.hoisted(() => ({
  sendEmailConfirmationLink: vi.fn(),
}));

vi.mock('@client/services/user', () => ({
  UserService: function UserService() {
    return { sendEmailConfirmationLink };
  },
}));

const enabled = (value: string): Connection => ({ value, enabled: true });

describe('Consents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendEmailConfirmationLink.mockResolvedValue(undefined);
  });

  it('renders connected and incomplete contact states', () => {
    const { container, rerender } = render(
      <Consents email={enabled('me@example.com')} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    expect(container).toBeEmptyDOMElement();

    rerender(<Consents email={enabled('me@example.com')} telegram={undefined} discord={undefined} />);
    expect(screen.getByText(/@rsschool_bot/i)).toBeInTheDocument();
    expect(screen.queryByText(/email is not verified/i)).not.toBeInTheDocument();

    rerender(<Consents email={undefined} telegram={enabled('tg')} discord={enabled('dc')} />);
    expect(screen.getByText(/enter your email on/i)).toBeInTheDocument();
    const profileLink = screen.getByRole('link', { name: /profile/i });
    expect(profileLink).toHaveAttribute('href', '/profile');

    rerender(
      <Consents email={{ value: 'me@example.com', enabled: false }} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    expect(screen.getByText(/email is not verified/i)).toBeInTheDocument();
  });

  it('sends a confirmation email when the resend link is clicked', async () => {
    render(
      <Consents email={{ value: 'me@example.com', enabled: false }} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    fireEvent.click(screen.getByText(/send confirmation email/i));

    await waitFor(() => expect(sendEmailConfirmationLink).toHaveBeenCalledTimes(1));
  });

  it('shows an error message when sending the confirmation email fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as ReturnType<typeof message.error>);
    sendEmailConfirmationLink.mockRejectedValue(new Error('boom'));

    render(
      <Consents email={{ value: 'me@example.com', enabled: false }} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    fireEvent.click(screen.getByText(/send confirmation email/i));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Error has occured. Please try again later'));
    errorSpy.mockRestore();
  });
});
