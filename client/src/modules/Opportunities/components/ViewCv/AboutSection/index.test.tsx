import { render, screen } from '@testing-library/react';
import { AboutSection } from './index';

vi.mock('antd', () => {
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    Row: Container,
    Col: Container,
    Card: ({ title, children }: { title?: React.ReactNode; children: React.ReactNode }) => (
      <section>
        {title}
        {children}
      </section>
    ),
    Avatar: Container,
    Typography: {
      Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
      Title: ({ children }: { children: React.ReactNode }) => <h4>{children}</h4>,
    },
  };
});

const mockNotes = 'Some notes';

describe('AboutSection', () => {
  test('should display notes and hide the section when notes are absent', () => {
    const { container, rerender } = render(<AboutSection notes={mockNotes} />);

    const notes = screen.getByText(mockNotes);

    expect(notes).toBeInTheDocument();

    rerender(<AboutSection notes={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
