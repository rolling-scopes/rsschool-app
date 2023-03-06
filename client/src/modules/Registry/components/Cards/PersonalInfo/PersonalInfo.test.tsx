import { fireEvent, render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS } from 'modules/Registry/constants';
import { PersonalInfo } from './PersonalInfo';

const mockValues = {
  firstName: 'John',
  lastName: 'Doe',
  location: null,
  primaryEmail: 'test@test.com',
  contactsEpamEmail: 'john_doe@epam.com',
};

type Values = typeof mockValues | Record<string, unknown>;

const renderPersonalInfo = (values: Values = mockValues, isStudentForm?: boolean) =>
  render(
    <Form role="form" initialValues={values}>
      <PersonalInfo location={null} setLocation={jest.fn()} isStudentForm={isStudentForm} />
    </Form>,
  );

describe('PersonalInfo', () => {
  test.each(
    Object.values(mockValues)
      .filter(Boolean)
      .map(value => ({ value })),
  )('should render form item with $value value', async ({ value }) => {
    renderPersonalInfo();

    const item = await screen.findByDisplayValue(value as string);
    expect(item).toBeInTheDocument();
  });

  test.each`
    label
    ${LABELS.firstName}
    ${LABELS.lastName}
    ${LABELS.primaryEmail}
    ${LABELS.epamEmail}
  `('should render field with $label label', async ({ label }) => {
    renderPersonalInfo();

    const fieldLabel = await screen.findByLabelText(label);
    expect(fieldLabel).toBeInTheDocument();
  });

  test('should render field with location label', async () => {
    renderPersonalInfo();
    const fieldLabel = await screen.findByText(LABELS.location);
    expect(fieldLabel).toBeInTheDocument();
  });

  test.each`
    placeholder
    ${PLACEHOLDERS.firstName}
    ${PLACEHOLDERS.lastName}
    ${PLACEHOLDERS.email}
    ${PLACEHOLDERS.epamEmail}
  `('should render field with $placeholder placeholder', async ({ placeholder }) => {
    renderPersonalInfo();

    const fieldPlaceholder = await screen.findByPlaceholderText(placeholder);
    expect(fieldPlaceholder).toBeInTheDocument();
  });

  test.each`
    placeholder               | message
    ${PLACEHOLDERS.email}     | ${ERROR_MESSAGES.email}
    ${PLACEHOLDERS.epamEmail} | ${ERROR_MESSAGES.epamEmail}
    ${PLACEHOLDERS.firstName} | ${ERROR_MESSAGES.inEnglish('First name')}
    ${PLACEHOLDERS.lastName}  | ${ERROR_MESSAGES.inEnglish('Last name')}
  `('should not render $message error message on valid input', async ({ placeholder, message }) => {
    renderPersonalInfo();

    const input = await screen.findByPlaceholderText(placeholder);
    const errorMessage = screen.queryByText(message);
    expect(input).toBeInTheDocument();
    expect(errorMessage).not.toBeInTheDocument();
  });

  test.each`
    placeholder               | value              | message
    ${PLACEHOLDERS.email}     | ${'test'}          | ${ERROR_MESSAGES.email}
    ${PLACEHOLDERS.epamEmail} | ${'test@epam.com'} | ${ERROR_MESSAGES.epamEmail}
    ${PLACEHOLDERS.firstName} | ${'Róża'}          | ${ERROR_MESSAGES.inEnglish('First name')}
    ${PLACEHOLDERS.lastName}  | ${'Wójcik'}        | ${ERROR_MESSAGES.inEnglish('Last name')}
  `('should render $message error message on invalid input', async ({ placeholder, value, message }) => {
    renderPersonalInfo();

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

  test('should render error messages only on required fields', async () => {
    renderPersonalInfo({});

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    const errorFirstName = await screen.findByText(ERROR_MESSAGES.inEnglish('First name'));
    const errorLocation = await screen.findByText(ERROR_MESSAGES.location);
    const errorEmail = await screen.findByText(ERROR_MESSAGES.email);
    const errorLastName = screen.queryByText(ERROR_MESSAGES.inEnglish('Last name'));
    const errorEpamEmail = screen.queryByText(ERROR_MESSAGES.epamEmail);

    expect(errorFirstName).toBeInTheDocument();
    expect(errorLocation).toBeInTheDocument();
    expect(errorEmail).toBeInTheDocument();
    expect(errorLastName).not.toBeInTheDocument();
    expect(errorEpamEmail).not.toBeInTheDocument();
  });

  test('should render data processing checkbox on student form', async () => {
    renderPersonalInfo(mockValues, true);

    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  test('should render Submit button on student form', async () => {
    renderPersonalInfo(mockValues, true);

    const button = await screen.findByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();
  });

  test('should not render data processing checkbox on mentor form', () => {
    renderPersonalInfo();

    const checkbox = screen.queryByRole('checkbox');
    expect(checkbox).not.toBeInTheDocument();
  });

  test('should not render Submit button on mentor form', () => {
    renderPersonalInfo();

    const button = screen.queryByRole('button', { name: /submit/i });
    expect(button).not.toBeInTheDocument();
  });
});
