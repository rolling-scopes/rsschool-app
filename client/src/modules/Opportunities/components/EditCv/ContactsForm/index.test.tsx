import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  test.each`
    value                              | placeholder                 | labelText
    ${mockContactsList.email}          | ${'Email'}                  | ${'Email'}
    ${mockContactsList.githubUsername} | ${'GitHub username'}        | ${'GitHub'}
    ${mockContactsList.linkedin}       | ${'LinkedIn username'}      | ${'LinkedIn'}
    ${mockContactsList.phone}          | ${'+12025550111'}           | ${'Phone'}
    ${mockContactsList.skype}          | ${'Skype id'}               | ${'Skype'}
    ${mockContactsList.telegram}       | ${'Telegram public name'}   | ${'Telegram'}
    ${mockContactsList.website}        | ${'Enter your website URL'} | ${'Website'}
  `('form field should have proper value, placeholder and label', async ({ value, placeholder, labelText }) => {
    render(<ContactsForm contactsList={mockContactsList} />);

    const fieldDisplayedValue = await screen.findByDisplayValue(value);
    const fieldPlaceholder = await screen.findByPlaceholderText(placeholder);
    const fieldLabel = await screen.findByLabelText(labelText);

    expect(fieldDisplayedValue).toBeInTheDocument();
    expect(fieldPlaceholder).toBeInTheDocument();
    expect(fieldLabel).toBeInTheDocument();
  });

  test('shows a validation error for an invalid phone number', async () => {
    const user = userEvent.setup();
    render(<ContactsForm contactsList={{} as never} />);

    const phone = await screen.findByLabelText('Phone');
    // A number without the leading "+" fails the custom phone validator.
    await user.type(phone, '12025550111');

    expect(await screen.findByText('This is not a valid phone number')).toBeInTheDocument();
  });

  test('accepts a valid phone number (no validation error)', async () => {
    const user = userEvent.setup();
    render(<ContactsForm contactsList={{} as never} />);

    const phone = await screen.findByLabelText('Phone');
    await user.type(phone, '+12025550111');

    await waitFor(() => expect(screen.queryByText('This is not a valid phone number')).not.toBeInTheDocument());
  });

  test('shows a validation error for an invalid github username', async () => {
    const user = userEvent.setup();
    render(<ContactsForm contactsList={{} as never} />);

    const github = await screen.findByLabelText('GitHub');
    // A username starting with a hyphen fails the github username pattern.
    await user.type(github, '-invalid-name-');

    expect(await screen.findByText('This is not a valid github username')).toBeInTheDocument();
  });
});
