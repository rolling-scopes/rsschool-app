import { render, screen } from '@testing-library/react';
import { Contacts } from '@client/modules/Opportunities/models';
import { ContactsSection } from './index';

vi.mock('./ContactsList', () => ({
  ContactsList: () => <div>Mock Contacts</div>,
}));

describe('ContactsSection', () => {
  test('should display nothing if contacts are not provided', () => {
    const { container } = render(<ContactsSection contacts={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('should display section if contacts are provided', () => {
    render(<ContactsSection contacts={{} as Contacts} />);
    const contactsList = screen.getByText('Mock Contacts');
    expect(contactsList).toBeInTheDocument();
  });
});
