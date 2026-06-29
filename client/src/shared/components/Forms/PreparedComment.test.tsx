import { render, screen } from '@testing-library/react';
import PreparedComment, { markdownLabel } from './PreparedComment';

// react-markdown is an ESM/heavy renderer; stub it to a passthrough so we can
// assert which rendering branch (markdown vs. plain) the component takes.
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));

describe('PreparedComment', () => {
  it('renders plain text split into lines when there is no markdown marker', () => {
    render(<PreparedComment text={'line one\nline two'} />);

    expect(screen.getByText('line one')).toBeInTheDocument();
    expect(screen.getByText('line two')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
  });

  it('renders the markdown branch (without the marker) when text starts with the markdown label', () => {
    render(<PreparedComment text={`${markdownLabel}# Heading`} />);

    const md = screen.getByTestId('markdown');
    expect(md).toBeInTheDocument();
    expect(md).toHaveTextContent('# Heading');
    expect(md).not.toHaveTextContent(markdownLabel.trim());
  });

  it('handles empty text gracefully', () => {
    const { container } = render(<PreparedComment text={''} />);

    expect(container).toBeInTheDocument();
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
  });

  it('falls back to an empty string when text is null/undefined', () => {
    // Exercises the `useState(text ?? '')` nullish fallback and the falsy guard
    // in the effect (`text && ...`) — no markdown branch, no crash.
    const { container } = render(<PreparedComment text={undefined as unknown as string} />);

    expect(container).toBeInTheDocument();
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
  });
});
