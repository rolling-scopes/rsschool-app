import { act, render, screen } from '@testing-library/react';
import { HeaderMiniBannerCarousel } from './HeaderMiniBannerCarousel';

describe('HeaderMiniBannerCarousel', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

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

  it('should rotate items by interval', () => {
    jest.useFakeTimers();

    render(
      <HeaderMiniBannerCarousel intervalMs={1000} items={[{ title: 'First slide' }, { title: 'Second slide' }]} />,
    );

    expect(screen.getByText('First slide')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Second slide')).toBeInTheDocument();
  });

  it('should render link when item has url', () => {
    render(<HeaderMiniBannerCarousel items={[{ title: 'Open docs', url: 'https://rs.school/docs/en' }]} />);

    expect(screen.getByRole('link', { name: 'Open docs' })).toHaveAttribute('href', 'https://rs.school/docs/en');
  });
});
