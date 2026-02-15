import { useEffect, useMemo, useState } from 'react';
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
  const visibleItems = useMemo(() => items.filter(item => item.banner || item.title), [items]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const item = visibleItems[activeIndex % visibleItems.length]!;
  const carouselClassName = [styles.carousel, className].filter(Boolean).join(' ');
  const label = item.title ?? 'Header banner';
  const content = item.banner ? (
    <img src={item.banner} alt={label} className={styles.banner} />
  ) : (
    <span className={styles.title}>{item.title}</span>
  );

  if (item.url) {
    return (
      <div className={carouselClassName}>
        <a href={item.url} className={styles.slide} title={label}>
          {content}
        </a>
      </div>
    );
  }

  return (
    <div className={carouselClassName}>
      <span className={styles.slide} title={label}>
        {content}
      </span>
    </div>
  );
}
