import { render, screen } from '@testing-library/react';
import { Link } from './index';

const mockUrl = 'https://example.com';
const mockTitle = 'Example title';
const mockText = 'Example text';

describe('Link', () => {
  test('should render working link without title and text', () => {
    render(<Link url={mockUrl} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', mockUrl);
    expect(link).toHaveClass('rs-link');
  });

  test('should render working link with title and text', () => {
    render(<Link url={mockUrl} title={mockTitle} text={mockText} />);

    const link = screen.getByTitle(mockTitle);

    expect(link).toHaveAttribute('href', mockUrl);
    expect(screen.getByText(mockText)).toBeInTheDocument();
  });
});
