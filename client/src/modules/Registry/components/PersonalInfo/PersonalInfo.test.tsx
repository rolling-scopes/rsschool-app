import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

const setup = () =>
  render(
    <Form initialValues={mockValues}>
      <PersonalInfo location={null} setLocation={jest.fn()} />
    </Form>,
  );

describe('PersonalInfo', () => {
  afterEach(() => {
    cleanup();
  });

  test('should render form items with proper values', async () => {
    setup();

    const firstName = await screen.findByDisplayValue(mockValues.firstName);
    const lastName = await screen.findByDisplayValue(mockValues.lastName);
    const primaryEmail = await screen.findByDisplayValue(mockValues.primaryEmail);
    const contactsEpamEmail = await screen.findByDisplayValue(mockValues.contactsEpamEmail);

    expect(firstName).toBeInTheDocument();
    expect(lastName).toBeInTheDocument();
    expect(primaryEmail).toBeInTheDocument();
    expect(contactsEpamEmail).toBeInTheDocument();
  });

  test.each`
    label
    ${LABELS.firstName}
    ${LABELS.lastName}
    ${LABELS.primaryEmail}
    ${LABELS.epamEmail}
  `('should render field with $label label', async ({ label }) => {
    setup();
    const fieldLabel = await screen.findByLabelText(label);
    expect(fieldLabel).toBeInTheDocument();
  });

  test('should render field with location label', async () => {
    setup();
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

  test('should render error message on wrong EPAM email input', async () => {
    setup();

    const wrongEmail = 'test@test.com';

    const emailInput = await screen.findByPlaceholderText(PLACEHOLDERS.epamEmail);
    const noErrorMessage = screen.queryByText(ERROR_MESSAGES.epamEmail);
    expect(emailInput).toBeInTheDocument();
    expect(noErrorMessage).not.toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: {
        value: wrongEmail,
      },
    });

    expect(emailInput).toHaveValue(wrongEmail);

    const errorMessage = await screen.findByText(ERROR_MESSAGES.epamEmail);
    expect(errorMessage).toBeInTheDocument();
  });

  test('should render error message on wrong first name input', async () => {
    setup();

    const wrongName = 'Джон';

    const nameInput = await screen.findByPlaceholderText(PLACEHOLDERS.firstName);
    const noErrorMessage = screen.queryByText(ERROR_MESSAGES.inEnglish('First name'));
    expect(nameInput).toBeInTheDocument();
    expect(noErrorMessage).not.toBeInTheDocument();

    fireEvent.change(nameInput, {
      target: {
        value: wrongName,
      },
    });

    expect(nameInput).toHaveValue(wrongName);

    const errorMessage = await screen.findByText(ERROR_MESSAGES.inEnglish('First name'));
    expect(errorMessage).toBeInTheDocument();
  });

  test('should render error message on wrong last name input', async () => {
    setup();

    const wrongName = 'Доу';

    const nameInput = await screen.findByPlaceholderText(PLACEHOLDERS.lastName);
    const noErrorMessage = screen.queryByText(ERROR_MESSAGES.inEnglish('Last name'));
    expect(nameInput).toBeInTheDocument();
    expect(noErrorMessage).not.toBeInTheDocument();

    fireEvent.change(nameInput, {
      target: {
        value: wrongName,
      },
    });

    expect(nameInput).toHaveValue(wrongName);

    const errorMessage = await screen.findByText(ERROR_MESSAGES.inEnglish('Last name'));
    expect(errorMessage).toBeInTheDocument();
  });

  test('should render error messages only on required fields', async () => {
    render(
      <Form role="form" name="test" initialValues={{}}>
        <PersonalInfo location={null} setLocation={jest.fn()} />
      </Form>,
    );

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
});
