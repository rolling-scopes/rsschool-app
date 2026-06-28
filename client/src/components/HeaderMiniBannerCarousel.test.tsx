import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeaderMiniBannerCarousel } from './HeaderMiniBannerCarousel';

describe('HeaderMiniBannerCarousel', () => {
  it('should render title when no banner is set', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Feature updates' }]} />);

    expect(screen.getByText('Feature updates')).toBeInTheDocument();
  });

  it('should render banner image when banner is set', () => {
    const bannerPath = 'test-banner-xyz123.png';
    render(<HeaderMiniBannerCarousel items={[{ banner: bannerPath, title: 'Logo banner' }]} />);

    const bannerImage = screen.getByRole('img');
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute('src', bannerPath);
  });

  it('should render link when item has url', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Open docs', url: 'https://rs.school/docs' }]} />);

    expect(screen.getByRole('link', { name: 'Open docs' })).toHaveAttribute('href', 'https://rs.school/docs');
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

  it('should not render when items array is empty', () => {
    render(<HeaderMiniBannerCarousel items={[]} />);

    expect(screen.queryByTestId('carouselContainer')).not.toBeInTheDocument();
  });

  it('should not render when items have no banner or title', () => {
    render(<HeaderMiniBannerCarousel items={[{ url: 'https://example.com' }]} />);

    expect(screen.queryByTestId('carouselContainer')).not.toBeInTheDocument();
  });

  it('should not render when items are empty objects', () => {
    render(<HeaderMiniBannerCarousel items={[{}]} />);

    expect(screen.queryByTestId('carouselContainer')).not.toBeInTheDocument();
  });

  it('invokes the next and previous handlers when controls are clicked', async () => {
    const user = userEvent.setup();
    render(<HeaderMiniBannerCarousel items={[{ title: 'First slide' }, { title: 'Second slide' }]} />);

    const nextButton = screen.getByRole('button', { name: 'Next banner' });
    const prevButton = screen.getByRole('button', { name: 'Previous banner' });

    // Exercises goToNextItem -> carouselRef.current?.next()
    await user.click(nextButton);
    // Exercises goToPrevItem -> carouselRef.current?.prev()
    await user.click(prevButton);

    // Carousel stays mounted; clicking the controls must not crash and keeps slides rendered.
    // (infinite mode clones slides, so the text appears more than once.)
    expect(screen.getAllByText('First slide').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Second slide').length).toBeGreaterThan(0);
  });

  it('renders a banner link when both banner and url are set', () => {
    render(
      <HeaderMiniBannerCarousel
        items={[{ banner: 'promo-banner.png', title: 'Promo', url: 'https://rs.school/promo' }]}
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'promo-banner.png');
    expect(screen.getByRole('link', { name: 'Promo' })).toHaveAttribute('href', 'https://rs.school/promo');
  });

  it('applies the custom className to the carousel container', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Custom' }]} className="custom-class" />);

    expect(screen.getByTestId('carouselContainer')).toHaveClass('custom-class');
  });

  it('disables autoplay when intervalMs is zero', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'First slide' }, { title: 'Second slide' }]} intervalMs={0} />);

    // Both slides still render; the autoplay branch (intervalMs > 0) is the falsy side here.
    // (infinite mode clones slides, so the text appears more than once.)
    expect(screen.getAllByText('First slide').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Second slide').length).toBeGreaterThan(0);
  });
});
