import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import ContactsCardForm from '../ContactsCardForm';
import { Contact, ContactsKeys } from '@client/services/user';

describe('ContactsCardForm', () => {
  const contacts: Contact[] = [
    {
      name: 'EPAM E-mail',
      value: 'epamEmail',
      key: ContactsKeys.EpamEmail,
      rules: [{ type: 'email', message: 'Email is not valid' }],
    },
    {
      name: 'E-mail',
      value: 'email',
      key: ContactsKeys.Email,
      rules: [{ type: 'email', message: 'Email is not valid' }],
    },
  ];

  describe('Should render correctly', () => {
    it('if "contacts" is not empty', () => {
      const { container } = render(<ContactsCardForm contacts={contacts} setHasError={vi.fn()} setValues={vi.fn()} />);
      expect(container).toMatchSnapshot();
    });
    it('if "contacts" is empty', () => {
      const { container } = render(<ContactsCardForm contacts={[]} setHasError={vi.fn()} setValues={vi.fn()} />);
      expect(container).toMatchSnapshot();
    });
  });

  it('propagates changed values via setValues on input (handleChanges, valid input)', async () => {
    const user = setupUser();
    const setValues = vi.fn();
    const setHasError = vi.fn();
    render(<ContactsCardForm contacts={contacts} setHasError={setHasError} setValues={setValues} />);

    const email = screen.getByLabelText('E-mail:');
    await user.type(email, 'valid@example.com');

    await waitFor(() => expect(setValues).toHaveBeenCalled());
    const lastCall = setValues.mock.calls.at(-1)?.[0];
    expect(lastCall[ContactsKeys.Email]).toContain('valid@example.com');
  });

  it('flags an error via setHasError when an invalid email is entered (validation reject branch)', async () => {
    const user = setupUser();
    const setValues = vi.fn();
    const setHasError = vi.fn();
    render(<ContactsCardForm contacts={contacts} setHasError={setHasError} setValues={setValues} />);

    const email = screen.getByLabelText('E-mail:');
    await user.type(email, 'not-an-email');

    // validateFields rejects -> setHasError(true) eventually called
    await waitFor(() => expect(setHasError).toHaveBeenCalledWith(true));
  });
});
