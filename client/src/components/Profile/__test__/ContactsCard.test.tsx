import React from 'react';
import { render } from '@testing-library/react';
import ContactsCard from '../ContactsCard';

describe('ContactsCard', () => {
  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const wrapper = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: 'televasya',
            notes: 'vasya',
            linkedIn: 'http://linkedin_test.com/vasya',
          }}
          isEditingModeEnabled={false}
          sendConfirmationEmail={jest.fn()}
          connections={{}}
          updateProfile={jest.fn()}
        />,
      );
      expect(wrapper.container).toMatchSnapshot();
    });
    it('if editing mode is enabled', () => {
      const wrapper = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: null,
            notes: null,
            linkedIn: null,
          }}
          isEditingModeEnabled={true}
          sendConfirmationEmail={jest.fn()}
          connections={{}}
          updateProfile={jest.fn()}
        />,
      );
      expect(wrapper.container).toMatchSnapshot();
    });
  });
});
