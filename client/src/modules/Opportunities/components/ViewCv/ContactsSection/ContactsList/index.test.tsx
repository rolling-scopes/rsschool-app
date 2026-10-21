import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactsList } from './index';

// Boundaries: clipboard (react-use) and the notification toast (@client/hooks).
const { copyToClipboard, notificationSuccess } = vi.hoisted(() => ({
  copyToClipboard: vi.fn(),
  notificationSuccess: vi.fn(),
}));
vi.mock('react-use', async () => ({
  ...(await vi.importActual('react-use')),
  useCopyToClipboard: () => [{}, copyToClipboard] as const,
}));
vi.mock('@client/hooks', () => ({
  useMessage: () => ({ notification: { success: notificationSuccess } }),
}));

const mockContacts = {
  email: 'example@example.com',
  githubUsername: 'some-github',
  linkedin: 'https://linked.in',
  phone: '+1111111111111',
  skype: 'some_skype',
  telegram: 'some_telegram',
  website: 'https://example.com',
};

describe('ContactsList', () => {
  test('renders contacts and copies populated and missing values', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ContactsList contacts={mockContacts} />);

    const email = screen.getByText(mockContacts.email);
    const githubUsername = screen.getByText(mockContacts.githubUsername);
    const linkedin = screen.getByText(mockContacts.linkedin);
    const phone = screen.getByText(mockContacts.phone);
    const skype = screen.getByText(mockContacts.skype);
    const telegram = screen.getByText(`@${mockContacts.telegram}`);
    const website = screen.getByText(mockContacts.website);

    expect(email).toBeInTheDocument();
    expect(githubUsername).toBeInTheDocument();
    expect(linkedin).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(skype).toBeInTheDocument();
    expect(telegram).toBeInTheDocument();
    expect(website).toBeInTheDocument();

    const emailIcon = screen.getByRole('img', { name: 'mail' });
    const githubIcon = screen.getByRole('img', { name: 'github' });
    const linkedinIcon = screen.getByRole('img', { name: 'linkedin' });
    const phoneIcon = screen.getByRole('img', { name: 'phone' });
    const skypeIcon = screen.getByRole('img', { name: 'skype' });
    const telegramIcon = screen.getByRole('img', { name: 'message' });
    const websiteIcon = screen.getByRole('img', { name: 'idcard' });

    expect(emailIcon).toBeInTheDocument();
    expect(githubIcon).toBeInTheDocument();
    expect(linkedinIcon).toBeInTheDocument();
    expect(phoneIcon).toBeInTheDocument();
    expect(skypeIcon).toBeInTheDocument();
    expect(telegramIcon).toBeInTheDocument();
    expect(websiteIcon).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(7);

    const [emailLink, githubLink, linkedinLink, phoneLink, skypeLink, telegramLink, websiteLink] = links;

    expect(emailLink).toHaveAttribute('title', 'E-mail');
    expect(githubLink).toHaveAttribute('title', 'GitHub');
    expect(linkedinLink).toHaveAttribute('title', 'LinkedIn');
    expect(phoneLink).toHaveAttribute('title', 'Phone');
    expect(skypeLink).toHaveAttribute('title', 'Skype');
    expect(telegramLink).toHaveAttribute('title', 'Telegram');
    expect(websiteLink).toHaveAttribute('title', 'Website');

    rerender(<ContactsList contacts={{ email: 'copy@me.com' }} />);
    await user.click(screen.getByRole('button'));

    expect(copyToClipboard).toHaveBeenCalledWith('copy@me.com');
    expect(notificationSuccess).toHaveBeenCalledWith({ message: 'Copied to clipboard' });

    rerender(<ContactsList contacts={{ email: undefined } as never} />);
    await user.click(screen.getByRole('button'));

    expect(copyToClipboard).toHaveBeenCalledWith('');
  });
});
