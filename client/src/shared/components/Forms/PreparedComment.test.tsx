import { render, screen, within } from '@testing-library/react';
import PreparedComment, { markdownLabel } from './PreparedComment';

// react-markdown is an ESM/heavy renderer; stub it to a passthrough so we can
// assert which rendering branch (markdown vs. plain) the component takes.
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
vi.mock('remark-gfm', () => ({ default: () => {} }));
vi.mock('antd', () => ({
  Typography: { Text: ({ children }: React.PropsWithChildren) => <div>{children}</div> },
}));

describe('PreparedComment', () => {
  it('renders plain, markdown, empty, and undefined initial text', () => {
    render(
      <>
        <section data-testid="plain">
          <PreparedComment text={'line one\nline two'} />
        </section>
        <section data-testid="marked">
          <PreparedComment text={`${markdownLabel}# Heading`} />
        </section>
        <section data-testid="empty">
          <PreparedComment text="" />
        </section>
        <section data-testid="undefined">
          <PreparedComment text={undefined as unknown as string} />
        </section>
      </>,
    );

    const plain = within(screen.getByTestId('plain'));
    expect(plain.getByText('line one')).toBeInTheDocument();
    expect(plain.getByText('line two')).toBeInTheDocument();
    expect(plain.queryByTestId('markdown')).not.toBeInTheDocument();

    const marked = within(screen.getByTestId('marked'));
    const md = marked.getByTestId('markdown');
    expect(md).toBeInTheDocument();
    expect(md).toHaveTextContent('# Heading');
    expect(md).not.toHaveTextContent(markdownLabel.trim());

    expect(within(screen.getByTestId('empty')).queryByTestId('markdown')).not.toBeInTheDocument();
    expect(within(screen.getByTestId('undefined')).queryByTestId('markdown')).not.toBeInTheDocument();
  });
});
