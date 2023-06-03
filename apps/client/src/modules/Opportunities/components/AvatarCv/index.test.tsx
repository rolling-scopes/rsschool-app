import { render, screen } from '@testing-library/react';
import { AvatarCv } from './index';

const mockUrl = 'https://example.com';

describe('AvatarCv', () => {
  test('should render img with proper src if provided', () => {
    render(<AvatarCv src={mockUrl} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockUrl);
  });

  test('should render icon if src is not provided', () => {
    render(<AvatarCv src={null} />);
    const img = screen.queryByRole('img');
    expect(img).not.toHaveAttribute('src');
  });
});
