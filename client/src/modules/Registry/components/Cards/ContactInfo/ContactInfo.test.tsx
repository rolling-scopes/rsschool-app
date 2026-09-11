import { fireEvent, render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS, RSSCHOOL_BOT_LINK } from '@client/modules/Registry/constants';
import { ContactInfo } from './ContactInfo';

const mockValues = {
  contactsTelegram: 'telegram',
  contactsSkype: 'skype',
  contactsWhatsApp: 'whatsapp',
  contactsEmail: 'test@test.com',
  contactsPhone: '+123456789',
  contactsNotes: 'notes',
};

type Values = typeof mockValues | Record<string, unknown>;

const renderContactInfo = (values: Values = mockValues) =>
  render(
    <Form role="form" initialValues={values}>
      <ContactInfo />
    </Form>,
  );

describe('ContactInfo', () => {
  test('should render initial values, labels, placeholders and navigation', () => {
    renderContactInfo();

    for (const value of Object.values(mockValues)) {
      expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    }
    for (const label of [LABELS.telegram, LABELS.skype, LABELS.whatsApp, LABELS.email, LABELS.phone, LABELS.notes]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    for (const placeholder of [
      PLACEHOLDERS.telegram,
      PLACEHOLDERS.skype,
      PLACEHOLDERS.whatsApp,
      PLACEHOLDERS.email,
      PLACEHOLDERS.phone,
      PLACEHOLDERS.notes,
    ]) {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', RSSCHOOL_BOT_LINK);
  });

  test.each`
    placeholder           | value          | message
    ${PLACEHOLDERS.email} | ${'test'}      | ${ERROR_MESSAGES.email}
    ${PLACEHOLDERS.phone} | ${String(123)} | ${ERROR_MESSAGES.phone}
  `('should render $message error message on invalid input', async ({ placeholder, value, message }) => {
    renderContactInfo();

    const input = await screen.findByPlaceholderText(placeholder);
    expect(input).toBeInTheDocument();
    expect(screen.queryByText(message)).not.toBeInTheDocument();

    fireEvent.change(input, {
      target: {
        value,
      },
    });

    expect(input).toHaveValue(value);

    const errorMessage = await screen.findByText(message);
    expect(errorMessage).toBeInTheDocument();
  });

  test('should render error messages only on required fields', async () => {
    renderContactInfo({});

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    const errorEmail = await screen.findByText(ERROR_MESSAGES.email);

    expect(errorEmail).toBeInTheDocument();
  });
});
