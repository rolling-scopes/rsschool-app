import { Contacts } from 'modules/Opportunities/models';
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
      <ContactsList contacts={contacts} />
    </div>
  );
};
