import { useMemo, useRef } from 'react';
import { Carousel, theme } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
import styles from './HeaderMiniBannerCarousel.module.css';

export type HeaderMiniBannerCarouselItem = {
  banner?: string;
  title?: string;
  url?: string;
};

type Props = {
  items?: ReadonlyArray<HeaderMiniBannerCarouselItem>;
  intervalMs?: number;
  className?: string;
};

const DEFAULT_INTERVAL_MS = 5000;

export function HeaderMiniBannerCarousel({ items = [], intervalMs = DEFAULT_INTERVAL_MS, className }: Props) {
  const { token } = theme.useToken();
  const carouselRef = useRef<CarouselRef>(null);
  const visibleItems = useMemo(() => items.filter(item => item.banner || item.title), [items]);
  const hasControls = visibleItems.length > 1;

  if (visibleItems.length === 0) {
    return null;
  }

  const goToPrevItem = () => {
    carouselRef.current?.prev();
  };

  const goToNextItem = () => {
    carouselRef.current?.next();
  };
  const carouselClassName = [styles.carousel, className].filter(Boolean).join(' ');
  const controlStyle = {
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorderSecondary,
    color: token.colorText,
  };

  return (
    <div data-testid="carouselContainer" className={carouselClassName}>
      <Carousel
        ref={carouselRef}
        className={styles.carouselInner}
        autoplay={hasControls && intervalMs > 0}
        autoplaySpeed={intervalMs}
        dots={false}
        infinite={hasControls}
      >
        {visibleItems.map((item, idx) => {
          const label = item.title ?? 'Header banner';
          const content = item.banner ? (
            <img src={item.banner} alt={label} className={styles.banner} />
          ) : (
            <span className={styles.title} style={{ color: token.colorText }}>
              {item.title}
            </span>
          );

          return (
            <div
              key={`${item.url ?? ''}-${item.banner ?? ''}-${item.title ?? label}-${idx}`}
              className={styles.slideContent}
            >
              {item.url ? (
                <a href={item.url} className={styles.slide} title={label}>
                  {content}
                </a>
              ) : (
                <span className={styles.slide} title={label}>
                  {content}
                </span>
              )}
            </div>
          );
        })}
      </Carousel>
      {hasControls ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            className={styles.controlLeft}
            style={controlStyle}
            onClick={goToPrevItem}
          >
            {'<'}
          </button>
          <button
            type="button"
            aria-label="Next banner"
            className={styles.controlRight}
            style={controlStyle}
            onClick={goToNextItem}
          >
            {'>'}
          </button>
        </>
      ) : null}
    </div>
  );
}
