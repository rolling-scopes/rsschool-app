/* eslint-disable testing-library/no-node-access -- antd applies sizing to the image wrapper element */
import { render, screen } from '@testing-library/react';
import { SlothImage } from './SlothImage';

describe('SlothImage', () => {
  it('renders default, custom-extension, and sized images', () => {
    const { rerender } = render(<SlothImage name="welcome" />);

    const img = screen.getByRole('img', { name: 'welcome' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cdn.rs.school/sloths/stickers/welcome/image.svg');

    rerender(<SlothImage name="hero" imgExtension="png" />);

    const pngImg = screen.getByRole('img', { name: 'hero' });
    expect(pngImg).toHaveAttribute('src', 'https://cdn.rs.school/sloths/stickers/hero/image.png');

    rerender(<SlothImage name="mentor" width={120} />);

    const sizedImg = screen.getByRole('img', { name: 'mentor' });
    expect(sizedImg).toHaveAttribute('alt', 'mentor');
    // antd applies the width to the image wrapper element
    const wrapper = sizedImg.closest('.ant-image');
    expect(wrapper).toHaveStyle({ width: '120px' });
  });
});
