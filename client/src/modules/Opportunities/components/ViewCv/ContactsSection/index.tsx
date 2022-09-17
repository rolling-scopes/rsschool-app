import { Contacts } from 'modules/Opportunities/models';
import { SidebarSectionHeader } from 'modules/Opportunities/components/SidebarSectionHeader';
import { ContactsList } from './ContactsList';

type Props = {
  contacts: Contacts | null;
};

export const ContactsSection = ({ contacts }: Props) => {
  if (contacts == null) {
    return null;
  }

  return (
    <div>
      <SidebarSectionHeader title="Contacts" />
      <ContactsList contacts={contacts} />
    </div>
  );
};
