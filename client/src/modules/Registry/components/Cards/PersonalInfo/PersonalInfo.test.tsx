import { fireEvent, render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { ERROR_MESSAGES, LABELS, PLACEHOLDERS } from '@client/modules/Registry/constants';
import { PersonalInfo } from './PersonalInfo';
import usePlacesAutocomplete from 'use-places-autocomplete';

vi.mock('use-places-autocomplete');

vi.mocked(usePlacesAutocomplete).mockImplementation(() => ({
  value: null,
  suggestions: {
    data: {
      map: vi.fn(),
    },
    loading: false,
  },
  setValue: vi.fn(),
}));

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
      <PersonalInfo location={null} setLocation={vi.fn()} isStudentForm={isStudentForm} />
    </Form>,
  );

describe('PersonalInfo', () => {
  test('should render initial mentor values, labels and placeholders', () => {
    renderPersonalInfo();

    for (const value of Object.values(mockValues).filter(Boolean)) {
      expect(screen.getByDisplayValue(value as string)).toBeInTheDocument();
    }
    for (const label of [LABELS.firstName, LABELS.lastName, LABELS.primaryEmail, LABELS.epamEmail]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(LABELS.location)).toBeInTheDocument();
    for (const placeholder of [
      PLACEHOLDERS.firstName,
      PLACEHOLDERS.lastName,
      PLACEHOLDERS.email,
      PLACEHOLDERS.epamEmail,
    ]) {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    }
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });

  test.each`
    placeholder               | value              | message
    ${PLACEHOLDERS.email}     | ${'test'}          | ${ERROR_MESSAGES.email}
    ${PLACEHOLDERS.epamEmail} | ${'test@epam.com'} | ${ERROR_MESSAGES.epamEmail}
    ${PLACEHOLDERS.firstName} | ${'Róża'}          | ${ERROR_MESSAGES.inEnglish('First name')}
    ${PLACEHOLDERS.lastName}  | ${'Wójcik'}        | ${ERROR_MESSAGES.inEnglish('Last name')}
  `(
    'should show $message only after changing valid input to invalid input',
    async ({ placeholder, value, message }) => {
      renderPersonalInfo();

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
    },
  );

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
    expect(errorLastName).toBeInTheDocument();
    expect(errorEpamEmail).not.toBeInTheDocument();
  });

  test('should render data processing checkbox and Submit button on student form', async () => {
    renderPersonalInfo(mockValues, true);

    expect(await screen.findByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});
