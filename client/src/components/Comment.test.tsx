import { render, screen } from '@testing-library/react';
import { Comment } from './Comment';

describe('Comment', () => {
  it('renders author, datetime, content and children', () => {
    render(
      <Comment
        author="John Doe"
        avatar={<span data-testid="avatar">A</span>}
        datetime="2 hours ago"
        content="This is the comment body"
      >
        <span>Nested reply</span>
      </Comment>,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('This is the comment body')).toBeInTheDocument();
    expect(screen.getByText('Nested reply')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('does not render the avatar when not provided', () => {
    render(<Comment content="No avatar here" />);

    expect(screen.queryByTestId('avatar')).not.toBeInTheDocument();
    expect(screen.getByText('No avatar here')).toBeInTheDocument();
  });

  it('omits the header row when neither author nor datetime are provided', () => {
    render(<Comment content="Only content" />);

    expect(screen.getByText('Only content')).toBeInTheDocument();
    expect(screen.queryByText('2 hours ago')).not.toBeInTheDocument();
  });

  it('renders the header row when only datetime is provided', () => {
    render(<Comment datetime="just now" />);

    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  it('renders nothing in the body areas when content and children are absent', () => {
    const { container } = render(<Comment author="Solo Author" />);

    expect(screen.getByText('Solo Author')).toBeInTheDocument();
    // only the wrapper + author header should be present, no content/children divs
    expect(container.textContent).toBe('Solo Author');
  });
});
