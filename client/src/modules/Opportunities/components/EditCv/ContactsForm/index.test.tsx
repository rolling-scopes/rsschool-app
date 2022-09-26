import { cleanup, render, screen } from '@testing-library/react';
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
  // eslint-disable-next-line testing-library/no-render-in-setup
  beforeEach(() => render(<ContactsForm contactsList={mockContactsList} />));

  afterEach(cleanup);

  test.each`
    contactName   | expectedValue
    ${'Email'}    | ${mockContactsList.email}
    ${'Github'}   | ${mockContactsList.githubUsername}
    ${'Linkedin'} | ${mockContactsList.linkedin}
    ${'Phone'}    | ${mockContactsList.phone}
    ${'Skype'}    | ${mockContactsList.skype}
    ${'Telegram'} | ${mockContactsList.telegram}
    ${'Website'}  | ${mockContactsList.website}
  `('should render "$contactName" field with proper value', ({ expectedValue }) => {
    const input = screen.getByDisplayValue(expectedValue);
    expect(input).toBeInTheDocument();
  });

  test.each`
    contactName   | placeholderText
    ${'Email'}    | ${'Email'}
    ${'Github'}   | ${'Github username'}
    ${'Linkedin'} | ${'LinkedIn username'}
    ${'Phone'}    | ${'+12025550111'}
    ${'Skype'}    | ${'Skype id'}
    ${'Telegram'} | ${'Telegram public name'}
    ${'Website'}  | ${'Enter your website URL'}
  `('should render "$contactName" field with proper placeholder', ({ placeholderText }) => {
    const input = screen.getByPlaceholderText(placeholderText);
    expect(input).toBeInTheDocument();
  });

  test.each`
    contactName   | labelText
    ${'Email'}    | ${'Email'}
    ${'Github'}   | ${'Github'}
    ${'Linkedin'} | ${'LinkedIn'}
    ${'Phone'}    | ${'Phone'}
    ${'Skype'}    | ${'Skype'}
    ${'Telegram'} | ${'Telegram'}
    ${'Website'}  | ${'Website'}
  `('should render "$contactName" field with proper Label', ({ labelText }) => {
    const input = screen.getByLabelText(labelText);
    expect(input).toBeInTheDocument();
  });
});
