import { render, screen } from '@testing-library/react';
import { ListItemMeta } from './ListItemMeta';

describe('ListItemMeta', () => {
  it('renders title when provided', () => {
    render(<ListItemMeta title="Item Title" />);

    expect(screen.getByText('Item Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<ListItemMeta description="Item description" />);

    expect(screen.getByText('Item description')).toBeInTheDocument();
  });

  it('renders avatar when provided', () => {
    render(<ListItemMeta avatar={<img src="avatar.png" alt="avatar" />} />);

    expect(screen.getByAltText('avatar')).toBeInTheDocument();
  });

  it('renders all parts together', () => {
    render(<ListItemMeta avatar={<img src="avatar.png" alt="avatar" />} title="Title" description="Description" />);

    expect(screen.getByAltText('avatar')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('does not render avatar section when avatar is not provided', () => {
    render(<ListItemMeta title="Title" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
