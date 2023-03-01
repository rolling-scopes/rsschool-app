import { fireEvent, render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS, RSSCHOOL_BOT_LINK } from 'modules/Registry/constants';
import { ContactInfo } from './ContactInfo';

const mockValues = {
  contactsTelegram: 'telegram',
  contactsSkype: 'skype',
  contactsWhatsApp: 'whatsapp',
  contactsEmail: 'test@test.com',
  contactsPhone: '+123456789',
  contactsNotes: 'notes',
};

const renderContactInfo = () =>
  render(
    <Form initialValues={mockValues}>
      <ContactInfo />
    </Form>,
  );

describe('ContactInfo', () => {
  test.each(Object.values(mockValues).map(value => ({ value })))(
    'should render form item with $value value',
    async ({ value }) => {
      renderContactInfo();

      const item = await screen.findByDisplayValue(value);
      expect(item).toBeInTheDocument();
    },
  );

  test('should render Continue button', async () => {
    renderContactInfo();

    const button = await screen.findByRole('button', { name: /continue/i });
    expect(button).toBeInTheDocument();
  });

  test('should render Telegram bot link', async () => {
    renderContactInfo();

    const link = await screen.findByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', RSSCHOOL_BOT_LINK);
  });

  test.each`
    label
    ${LABELS.telegram}
    ${LABELS.skype}
    ${LABELS.whatsApp}
    ${LABELS.email}
    ${LABELS.phone}
    ${LABELS.notes}
  `('should render field with $label label', async ({ label }) => {
    renderContactInfo();

    const fieldLabel = await screen.findByLabelText(label);
    expect(fieldLabel).toBeInTheDocument();
  });

  test.each`
    placeholder
    ${PLACEHOLDERS.telegram}
    ${PLACEHOLDERS.skype}
    ${PLACEHOLDERS.whatsApp}
    ${PLACEHOLDERS.email}
    ${PLACEHOLDERS.phone}
    ${PLACEHOLDERS.notes}
  `('should render field with $placeholder placeholder', async ({ placeholder }) => {
    renderContactInfo();

    const fieldPlaceholder = await screen.findByPlaceholderText(placeholder);
    expect(fieldPlaceholder).toBeInTheDocument();
  });

  test.each`
    placeholder           | message
    ${PLACEHOLDERS.email} | ${ERROR_MESSAGES.email}
    ${PLACEHOLDERS.phone} | ${ERROR_MESSAGES.phone}
  `('should not render $message error message on valid input', async ({ placeholder, message }) => {
    renderContactInfo();

    const input = await screen.findByPlaceholderText(placeholder);
    const errorMessage = screen.queryByText(message);
    expect(input).toBeInTheDocument();
    expect(errorMessage).not.toBeInTheDocument();
  });

  test.each`
    placeholder           | value          | message
    ${PLACEHOLDERS.email} | ${'test'}      | ${ERROR_MESSAGES.email}
    ${PLACEHOLDERS.phone} | ${String(123)} | ${ERROR_MESSAGES.phone}
  `('should render $message error message on invalid input', async ({ placeholder, value, message }) => {
    renderContactInfo();

    const input = await screen.findByPlaceholderText(placeholder);

    fireEvent.change(input, {
      target: {
        value,
      },
    });

    expect(input).toHaveValue(value);

    const errorMessage = await screen.findByText(message);
    expect(errorMessage).toBeInTheDocument();
  });
});
