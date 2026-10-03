import { act, render, screen } from '@testing-library/react';
import { HeaderMiniBannerCarousel } from './HeaderMiniBannerCarousel';

describe('HeaderMiniBannerCarousel', () => {
  it('renders a title and applies a custom class', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Feature updates' }]} className="custom-class" />);

    expect(screen.getByText('Feature updates')).toBeInTheDocument();
    expect(screen.getByTestId('carouselContainer')).toHaveClass('custom-class');
  });

  it('renders a linked banner image', () => {
    const bannerPath = 'test-banner-xyz123.png';
    render(
      <HeaderMiniBannerCarousel
        items={[
          {
            banner: bannerPath,
            title: 'Logo banner',
            url: 'https://rs.school/promo',
          },
        ]}
      />,
    );

    const bannerImage = screen.getByRole('img');
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute('src', bannerPath);
    expect(screen.getByRole('link', { name: 'Logo banner' })).toHaveAttribute('href', 'https://rs.school/promo');
  });

  it('should render link when item has url', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Open docs', url: 'https://rs.school/docs' }]} />);

    expect(screen.getByRole('link', { name: 'Open docs' })).toHaveAttribute('href', 'https://rs.school/docs');
  });

  it('renders working controls for multiple items', () => {
    vi.useFakeTimers();
    render(<HeaderMiniBannerCarousel items={[{ title: 'First slide' }, { title: 'Second slide' }]} intervalMs={0} />);

    const previousButton = screen.getByRole('button', {
      name: 'Previous banner',
    });
    const nextButton = screen.getByRole('button', { name: 'Next banner' });
    act(() => {
      nextButton.click();
      vi.runOnlyPendingTimers();
      previousButton.click();
      vi.runOnlyPendingTimers();
    });

    expect(screen.getAllByText('First slide').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Second slide').length).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it('should not render controls for single item', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Single slide' }]} />);

    expect(screen.queryByRole('button', { name: 'Previous banner' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next banner' })).not.toBeInTheDocument();
  });

  it('does not render without visible items', () => {
    const { rerender } = render(<HeaderMiniBannerCarousel items={[]} />);

    expect(screen.queryByTestId('carouselContainer')).not.toBeInTheDocument();
    rerender(<HeaderMiniBannerCarousel items={[{ url: 'https://example.com' }]} />);

    expect(screen.queryByTestId('carouselContainer')).not.toBeInTheDocument();
    rerender(<HeaderMiniBannerCarousel items={[{}]} />);

    expect(screen.queryByTestId('carouselContainer')).not.toBeInTheDocument();
  });

  it('disables autoplay when intervalMs is zero', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'First slide' }, { title: 'Second slide' }]} intervalMs={0} />);

    expect(screen.getAllByText('First slide').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Second slide').length).toBeGreaterThan(0);
  });
});
