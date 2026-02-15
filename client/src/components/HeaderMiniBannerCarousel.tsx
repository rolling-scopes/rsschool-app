import { useEffect, useMemo, useState } from 'react';
import { theme } from 'antd';
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
  const visibleItems = useMemo(() => items.filter(item => item.banner || item.title), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasControls = visibleItems.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [visibleItems.length]);

  useEffect(() => {
    if (visibleItems.length < 2 || intervalMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex(prevIndex => (prevIndex + 1) % visibleItems.length);
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [intervalMs, visibleItems.length]);

  if (visibleItems.length === 0) {
    return null;
  }

  const goToPrevItem = () => {
    setActiveIndex(prevIndex => (prevIndex - 1 + visibleItems.length) % visibleItems.length);
  };

  const goToNextItem = () => {
    setActiveIndex(prevIndex => (prevIndex + 1) % visibleItems.length);
  };

  const item = visibleItems[activeIndex % visibleItems.length]!;
  const carouselClassName = [styles.carousel, className].filter(Boolean).join(' ');
  const label = item.title ?? 'Header banner';
  const controlStyle = {
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorderSecondary,
    color: token.colorText,
  };
  const content = item.banner ? (
    <img src={item.banner} alt={label} className={styles.banner} />
  ) : (
    <span className={styles.title} style={{ color: token.colorText }}>
      {item.title}
    </span>
  );

  return (
    <div className={carouselClassName}>
      <div key={`${activeIndex}-${label}`} className={styles.slideContent}>
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
