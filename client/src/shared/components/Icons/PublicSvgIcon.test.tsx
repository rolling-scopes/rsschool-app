import { render, screen } from '@testing-library/react';
import { PublicSvgIcon } from './PublicSvgIcon';

describe('PublicSvgIcon', () => {
  it('renders the SVG as an isolated image', () => {
    render(<PublicSvgIcon src="/static/svg/course.svg" alt="Course" size="24px" />);

    expect(screen.getByRole('img', { name: 'Course' })).toHaveAttribute('src', '/static/svg/course.svg');
    expect(screen.getByRole('img', { name: 'Course' })).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('renders nothing when the source is missing', () => {
    const { container } = render(<PublicSvgIcon />);

    expect(container).toBeEmptyDOMElement();
  });
});
