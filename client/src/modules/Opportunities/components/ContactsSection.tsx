import { Contacts } from 'common/models/cv';
import ContactsList from './ContactsList';

type Props = {
  contacts: Contacts | null;
};

export function ContactsSection({ contacts }: Props) {
  if (contacts == null) {
    return null;
  }

  return (
    <div>
      <div style={{ fontSize: 14, paddingTop: 8, paddingBottom: 12 }}>
        <span className="cv-section-header">Contacts</span>
      </div>
      <ContactsList contacts={contacts} />
    </div>
  );
}
