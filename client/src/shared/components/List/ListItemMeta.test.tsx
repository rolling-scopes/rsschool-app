import { render, screen } from '@testing-library/react';
import { ListItemMeta } from './ListItemMeta';

describe('ListItemMeta', () => {
  it('renders each optional part and all parts together', () => {
    const { rerender } = render(<ListItemMeta title="Item Title" />);

    expect(screen.getByText('Item Title')).toBeInTheDocument();

    rerender(<ListItemMeta description="Item description" />);

    expect(screen.getByText('Item description')).toBeInTheDocument();

    rerender(<ListItemMeta avatar={<img src="avatar.png" alt="avatar" />} />);

    expect(screen.getByAltText('avatar')).toBeInTheDocument();

    rerender(<ListItemMeta avatar={<img src="avatar.png" alt="avatar" />} title="Title" description="Description" />);

    expect(screen.getByAltText('avatar')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();

    rerender(<ListItemMeta title="Title" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
