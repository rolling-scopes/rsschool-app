import { render, screen } from '@testing-library/react';
import { Contacts } from '@client/modules/Opportunities/models';
import { ContactsSection } from './index';

vi.mock('./ContactsList', () => ({
  ContactsList: () => <div>Mock Contacts</div>,
}));

describe('ContactsSection', () => {
  test('displays the section only when contacts are provided', () => {
    const { container, rerender } = render(<ContactsSection contacts={null} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<ContactsSection contacts={{} as Contacts} />);
    const contactsList = screen.getByText('Mock Contacts');
    expect(contactsList).toBeInTheDocument();
  });
});
