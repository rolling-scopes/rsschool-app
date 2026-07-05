import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders nothing when email and telegram are both connected', () => {
    const { container } = render(
      <Consents email={enabled('me@example.com')} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    // hasContacts is true → component returns null.
    expect(container).toBeEmptyDOMElement();
  });

  it('always shows the telegram bot info alert when contacts are incomplete', () => {
    render(<Consents email={enabled('me@example.com')} telegram={undefined} discord={undefined} />);

    expect(screen.getByText(/@rsschool_bot/i)).toBeInTheDocument();
  });

  it('prompts to add an email on the Profile page when no email is set', () => {
    render(<Consents email={undefined} telegram={enabled('tg')} discord={enabled('dc')} />);

    expect(screen.getByText(/enter your email on/i)).toBeInTheDocument();
    const profileLink = screen.getByRole('link', { name: /profile/i });
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('renders the email confirmation prompt when an email is added but not verified', () => {
    render(
      <Consents email={{ value: 'me@example.com', enabled: false }} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    expect(screen.getByText(/email is not verified/i)).toBeInTheDocument();
  });

  it('sends a confirmation email when the resend link is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Consents email={{ value: 'me@example.com', enabled: false }} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    await user.click(screen.getByText(/send confirmation email/i));

    await waitFor(() => expect(sendEmailConfirmationLink).toHaveBeenCalledTimes(1));
  });

  it('shows an error message when sending the confirmation email fails', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as ReturnType<typeof message.error>);
    sendEmailConfirmationLink.mockRejectedValue(new Error('boom'));

    render(
      <Consents email={{ value: 'me@example.com', enabled: false }} telegram={enabled('tg')} discord={enabled('dc')} />,
    );

    await user.click(screen.getByText(/send confirmation email/i));

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Error has occured. Please try again later'));
    errorSpy.mockRestore();
  });

  it('does not show the email confirmation prompt once the email is verified', () => {
    render(<Consents email={enabled('me@example.com')} telegram={undefined} discord={undefined} />);

    expect(screen.queryByText(/email is not verified/i)).not.toBeInTheDocument();
  });
});
