import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

const setup = () =>
  render(
    <Form initialValues={mockValues}>
      <ContactInfo />
    </Form>,
  );

describe('ContactInfo', () => {
  afterEach(() => {
    cleanup();
  });

  test('should render form items with proper values', async () => {
    setup();

    const telegram = await screen.findByDisplayValue(mockValues.contactsTelegram);
    const skype = await screen.findByDisplayValue(mockValues.contactsSkype);
    const whatsApp = await screen.findByDisplayValue(mockValues.contactsWhatsApp);
    const email = await screen.findByDisplayValue(mockValues.contactsEmail);
    const phone = await screen.findByDisplayValue(mockValues.contactsPhone);
    const notes = await screen.findByDisplayValue(mockValues.contactsNotes);

    expect(telegram).toBeInTheDocument();
    expect(skype).toBeInTheDocument();
    expect(whatsApp).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(phone).toBeInTheDocument();
    expect(notes).toBeInTheDocument();
  });

  test('should render Continue button', async () => {
    setup();

    const button = await screen.findByRole('button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Continue');
  });

  test('should render Telegram bot link', async () => {
    setup();

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
    setup();
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
    setup();
    const fieldPlaceholder = await screen.findByPlaceholderText(placeholder);
    expect(fieldPlaceholder).toBeInTheDocument();
  });

  test('should render error message on wrong email input', async () => {
    setup();

    const wrongEmail = 'test';

    const emailInput = await screen.findByPlaceholderText(PLACEHOLDERS.email);
    const noErrorMessage = screen.queryByText(ERROR_MESSAGES.email);
    expect(emailInput).toBeInTheDocument();
    expect(noErrorMessage).not.toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: {
        value: wrongEmail,
      },
    });

    expect(emailInput).toHaveValue(wrongEmail);

    const errorMessage = await screen.findByText(ERROR_MESSAGES.email);
    expect(errorMessage).toBeInTheDocument();
  });

  test('should render error message on wrong phone input', async () => {
    setup();

    const wrongPhone = '123';

    const phoneInput = await screen.findByPlaceholderText(PLACEHOLDERS.phone);
    const noErrorMessage = screen.queryByText(ERROR_MESSAGES.phone);
    expect(phoneInput).toBeInTheDocument();
    expect(noErrorMessage).not.toBeInTheDocument();

    fireEvent.change(phoneInput, {
      target: {
        value: wrongPhone,
      },
    });

    expect(phoneInput).toHaveValue(wrongPhone);

    const errorMessage = await screen.findByText(ERROR_MESSAGES.phone);
    expect(errorMessage).toBeInTheDocument();
  });
});
