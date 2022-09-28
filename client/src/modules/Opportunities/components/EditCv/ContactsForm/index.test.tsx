import { render, screen } from '@testing-library/react';
import { ContactsForm } from './index';

const mockContactsList = {
  email: 'example@example.com',
  githubUsername: 'alreadybored',
  linkedin: 'https://linked.in',
  phone: '+1111111111111',
  skype: 'some_skype',
  telegram: 'some_telegram',
  website: 'https://example.com',
};

describe('ContactsForm', () => {
  test('form fields should have proper values', async () => {
    render(<ContactsForm contactsList={mockContactsList} />);

    const email = await screen.findByDisplayValue(mockContactsList.email);
    const githubUsername = await screen.findByDisplayValue(mockContactsList.githubUsername);
    const linkedin = await screen.findByDisplayValue(mockContactsList.linkedin);
    const phone = await screen.findByDisplayValue(mockContactsList.phone);
    const skype = await screen.findByDisplayValue(mockContactsList.skype);
    const telegram = await screen.findByDisplayValue(mockContactsList.telegram);
    const website = await screen.findByDisplayValue(mockContactsList.website);

    expect(email).toBeInTheDocument();
    expect(githubUsername).toBeInTheDocument();
    expect(linkedin).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(skype).toBeInTheDocument();
    expect(telegram).toBeInTheDocument();
    expect(website).toBeInTheDocument();
  });

  test('form fields should have proper placeholders', async () => {
    render(<ContactsForm contactsList={mockContactsList} />);

    const email = await screen.findByPlaceholderText('Email');
    const githubUsername = await screen.findByPlaceholderText('Github username');
    const linkedin = await screen.findByPlaceholderText('LinkedIn username');
    const phone = await screen.findByPlaceholderText('+12025550111');
    const skype = await screen.findByPlaceholderText('Skype id');
    const telegram = await screen.findByPlaceholderText('Telegram public name');
    const website = await screen.findByPlaceholderText('Enter your website URL');

    expect(email).toBeInTheDocument();
    expect(githubUsername).toBeInTheDocument();
    expect(linkedin).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(skype).toBeInTheDocument();
    expect(telegram).toBeInTheDocument();
    expect(website).toBeInTheDocument();
  });

  test('form fields should have proper labels', async () => {
    render(<ContactsForm contactsList={mockContactsList} />);

    const email = await screen.findByLabelText('Email');
    const githubUsername = await screen.findByLabelText('Github');
    const linkedin = await screen.findByLabelText('LinkedIn');
    const phone = await screen.findByLabelText('Phone');
    const skype = await screen.findByLabelText('Skype');
    const telegram = await screen.findByLabelText('Telegram');
    const website = await screen.findByLabelText('Website');

    expect(email).toBeInTheDocument();
    expect(githubUsername).toBeInTheDocument();
    expect(linkedin).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(skype).toBeInTheDocument();
    expect(telegram).toBeInTheDocument();
    expect(website).toBeInTheDocument();
  });
});
