import { render, screen } from '@testing-library/react';
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
});
