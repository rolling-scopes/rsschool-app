import { render, screen } from '@testing-library/react';
import { ListItem } from './ListItem';

describe('ListItem', () => {
  it('renders children', () => {
    render(<ListItem>List item content</ListItem>);

    expect(screen.getByText('List item content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ListItem className="custom-class">content</ListItem>);

    expect(screen.getByText('content')).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    render(<ListItem style={{ opacity: 0.5 }}>content</ListItem>);

    expect(screen.getByText('content')).toHaveStyle({ opacity: '0.5' });
  });
});
