/* eslint-disable testing-library/no-node-access -- antd applies sizing to the image wrapper element */
import { render, screen } from '@testing-library/react';
import { SlothImage } from './SlothImage';

describe('SlothImage', () => {
  it('renders an image with the default svg extension', () => {
    render(<SlothImage name="welcome" />);

    const img = screen.getByRole('img', { name: 'welcome' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cdn.rs.school/sloths/stickers/welcome/image.svg');
  });

  it('renders with a png extension when requested', () => {
    render(<SlothImage name="hero" imgExtension="png" />);

    const img = screen.getByRole('img', { name: 'hero' });
    expect(img).toHaveAttribute('src', 'https://cdn.rs.school/sloths/stickers/hero/image.png');
  });

  it('forwards extra image props such as width', () => {
    render(<SlothImage name="mentor" width={120} />);

    const img = screen.getByRole('img', { name: 'mentor' });
    expect(img).toHaveAttribute('alt', 'mentor');
    // antd applies the width to the image wrapper element
    const wrapper = img.closest('.ant-image');
    expect(wrapper).toHaveStyle({ width: '120px' });
  });
});
