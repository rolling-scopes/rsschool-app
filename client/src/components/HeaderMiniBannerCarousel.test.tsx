import { render, screen } from '@testing-library/react';
import { HeaderMiniBannerCarousel } from './HeaderMiniBannerCarousel';

describe('HeaderMiniBannerCarousel', () => {
  it('should render title when no banner is set', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Feature updates' }]} />);

    expect(screen.getByText('Feature updates')).toBeInTheDocument();
  });

  it('should render banner image when banner is set', () => {
    render(
      <HeaderMiniBannerCarousel items={[{ banner: '/static/images/logo-rsschool3.png', title: 'Logo banner' }]} />,
    );

    expect(screen.getByAltText('Logo banner')).toBeInTheDocument();
  });

  it('should render link when item has url', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Open docs', url: 'https://rs.school/docs/en' }]} />);

    expect(screen.getByRole('link', { name: 'Open docs' })).toHaveAttribute('href', 'https://rs.school/docs/en');
  });

  it('should render controls for multiple items', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'First slide' }, { title: 'Second slide' }]} />);

    expect(screen.getByRole('button', { name: 'Previous banner' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next banner' })).toBeInTheDocument();
  });

  it('should not render controls for single item', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Single slide' }]} />);

    expect(screen.queryByRole('button', { name: 'Previous banner' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next banner' })).not.toBeInTheDocument();
  });
});
