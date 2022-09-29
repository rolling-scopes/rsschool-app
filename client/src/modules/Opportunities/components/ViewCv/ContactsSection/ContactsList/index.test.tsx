import { render, screen } from '@testing-library/react';
import { ContactsList } from './index';

const mockContacts = {
  email: 'example@example.com',
  githubUsername: 'alreadybored',
  linkedin: 'https://linked.in',
  phone: '+1111111111111',
  skype: 'some_skype',
  telegram: 'some_telegram',
  website: 'https://example.com',
};

describe('ContactsList', () => {
  test('should display proper values', () => {
    render(<ContactsList contacts={mockContacts} />);

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
  });

  test('should display corresponding icons', () => {
    render(<ContactsList contacts={mockContacts} />);

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
  });

  test('should have corresponding links', () => {
    render(<ContactsList contacts={mockContacts} />);

    const emailIcon = screen.getByRole('link', { name: 'E-mail' });
    const githubIcon = screen.getByRole('link', { name: 'Github' });
    const linkedinIcon = screen.getByRole('link', { name: 'LinkedIn' });
    const phoneIcon = screen.getByRole('link', { name: 'Phone' });
    const skypeIcon = screen.getByRole('link', { name: 'Skype' });
    const telegramIcon = screen.getByRole('link', { name: 'Telegram' });
    const websiteIcon = screen.getByRole('link', { name: 'Website' });

    expect(emailIcon).toBeInTheDocument();
    expect(githubIcon).toBeInTheDocument();
    expect(linkedinIcon).toBeInTheDocument();
    expect(phoneIcon).toBeInTheDocument();
    expect(skypeIcon).toBeInTheDocument();
    expect(telegramIcon).toBeInTheDocument();
    expect(websiteIcon).toBeInTheDocument();
  });
});
