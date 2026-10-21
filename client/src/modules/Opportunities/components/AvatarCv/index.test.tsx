import { render, screen } from '@testing-library/react';
import { AvatarCv } from './index';

const mockUrl = 'https://example.com';

describe('AvatarCv', () => {
  test('renders an image when provided and an icon otherwise', () => {
    const { rerender } = render(<AvatarCv src={mockUrl} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockUrl);

    rerender(<AvatarCv src={null} />);

    expect(screen.getByRole('img')).not.toHaveAttribute('src');
  });
});
