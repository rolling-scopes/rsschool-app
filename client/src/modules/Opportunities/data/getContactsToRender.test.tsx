import { getContactsToRender } from './getContactsToRender';

const mockContacts = {
  phone: '1',
  email: null,
  skype: '3',
  telegram: null,
  linkedin: null,
  githubUsername: '6',
  website: '7',
};

describe('getContactsToRender', () => {
  test('should return empty array if no contacts', () => {
    const view = getContactsToRender(null);
    expect(view).toStrictEqual([]);
  });

  test('should return contacts to render', () => {
    const view = getContactsToRender(mockContacts);
    expect(view).toStrictEqual([
      ['phone', '1'],
      ['skype', '3'],
      ['githubUsername', '6'],
      ['website', '7'],
    ]);
  });
});
