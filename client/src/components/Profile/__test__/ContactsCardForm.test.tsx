import React from 'react';
import { render } from '@testing-library/react';
import ContactsCardForm from '../ContactsCardForm';
import { Contact, ContactsKeys } from 'services/user';

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
      const { container } = render(
        <ContactsCardForm contacts={contacts} setHasError={jest.fn()} setValues={jest.fn()} />,
      );
      expect(container).toMatchSnapshot();
    });
    it('if "contacts" is empty', () => {
      const { container } = render(<ContactsCardForm contacts={[]} setHasError={jest.fn()} setValues={jest.fn()} />);
      expect(container).toMatchSnapshot();
    });
  });
});
