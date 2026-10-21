import { act, render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { ContactsForm } from './index';

const mockContactsList = {
  email: 'example@example.com',
  githubUsername: 'some-github',
  linkedin: 'https://linked.in',
  phone: '+1111111111111',
  skype: 'some_skype',
  telegram: 'some_telegram',
  website: 'https://example.com',
};

describe('ContactsForm', () => {
  test('renders each contact with its value, placeholder and label', async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act -- Await mount effects after the synchronous render
    await act(async () => {
      render(<ContactsForm contactsList={mockContactsList} />);
    });

    const fields = [
      [mockContactsList.email, 'Email', 'Email'],
      [mockContactsList.githubUsername, 'GitHub username', 'GitHub'],
      [mockContactsList.linkedin, 'LinkedIn username', 'LinkedIn'],
      [mockContactsList.phone, '+12025550111', 'Phone'],
      [mockContactsList.skype, 'Skype id', 'Skype'],
      [mockContactsList.telegram, 'Telegram public name', 'Telegram'],
      [mockContactsList.website, 'Enter your website URL', 'Website'],
    ];

    for (const [value, placeholder, labelText] of fields) {
      const field = screen.getByLabelText(labelText);
      expect(field).toBeInTheDocument();
      expect(field).toHaveValue(value);
      expect(field).toHaveAttribute('placeholder', placeholder);
    }
  });

  test('shows a validation error for an invalid phone number', async () => {
    const user = setupUser();
    render(<ContactsForm contactsList={{} as never} />);

    const phone = await screen.findByLabelText('Phone');
    // A number without the leading "+" fails the custom phone validator.
    await user.type(phone, '12025550111');

    expect(await screen.findByText('This is not a valid phone number')).toBeInTheDocument();
  });

  test('accepts a valid phone number (no validation error)', async () => {
    const user = setupUser();
    render(<ContactsForm contactsList={{} as never} />);

    const phone = await screen.findByLabelText('Phone');
    await user.type(phone, '+12025550111');

    await waitFor(() => expect(screen.queryByText('This is not a valid phone number')).not.toBeInTheDocument());
  });

  test('shows a validation error for an invalid github username', async () => {
    const user = setupUser();
    render(<ContactsForm contactsList={{} as never} />);

    const github = await screen.findByLabelText('GitHub');
    // A username starting with a hyphen fails the github username pattern.
    await user.type(github, '-invalid-name-');

    expect(await screen.findByText('This is not a valid github username')).toBeInTheDocument();
  });
});
