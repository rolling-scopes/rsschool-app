import { Contacts } from 'common/models/cv';

type EntryOf<T extends object> = { [K in keyof T]: [K, T[K]] }[keyof T];

export const getContactsToRender = (contacts: Contacts | null) => {
  if (!contacts) {
    return [];
  }
  const contactsEntries = Object.entries(contacts);
  return contactsEntries.filter((contact): contact is EntryOf<Contacts> => contact[1] !== null);
};
