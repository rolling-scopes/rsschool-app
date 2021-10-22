import { Contacts } from 'common/models/cv';
import ContactsList from './ContactsList';
import { SidebarSectionHeader } from './SidebarSectionHeader';

type Props = {
  contacts: Contacts | null;
};

export function ContactsSection({ contacts }: Props) {
  if (contacts == null) {
    return null;
  }

  return (
    <div>
      <SidebarSectionHeader title="Contacts" />
      <ContactsList contacts={contacts} />
    </div>
  );
}
