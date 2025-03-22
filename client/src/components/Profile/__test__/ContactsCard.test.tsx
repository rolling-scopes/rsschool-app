import React from 'react';
import { render } from '@testing-library/react';
import ContactsCard from '../ContactsCard';

describe('ContactsCard', () => {
  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const { container } = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: 'televasya',
            notes: 'vasya',
            linkedIn: 'http://linkedin_test.com/vasya',
            whatsApp: '1234567890',
          }}
          isEditingModeEnabled={false}
          sendConfirmationEmail={jest.fn()}
          connections={{}}
          updateProfile={jest.fn()}
        />,
      );
      expect(container).toMatchSnapshot();
    });
    it('if editing mode is enabled', () => {
      const { container } = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: null,
            notes: null,
            linkedIn: null,
            whatsApp: '1234567890',
          }}
          isEditingModeEnabled={true}
          sendConfirmationEmail={jest.fn()}
          connections={{}}
          updateProfile={jest.fn()}
        />,
      );
      expect(container).toMatchSnapshot();
    });
  });
});
