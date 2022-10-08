import { render, screen } from '@testing-library/react';
import { AboutSection } from './index';

const mockNotes = 'Some notes';

describe('AboutSection', () => {
  test('should display notes', () => {
    render(<AboutSection notes={mockNotes} />);

    const notes = screen.getByText(mockNotes);

    expect(notes).toBeInTheDocument();
  });

  test('should not display section if notes are not provided', () => {
    const { container } = render(<AboutSection notes={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
